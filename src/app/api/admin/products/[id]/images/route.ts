import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  adminAuthErrorResponse,
  adminServiceClient,
  requireAdmin,
} from "@/lib/admin-auth";

const reorderSchema = z.object({
  images: z
    .array(
      z.object({
        id: z.string().uuid(),
        position: z.number().int().nonnegative(),
        isMain: z.boolean(),
        alt: z.string().max(240).optional(),
      }),
    )
    .max(100),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const db = adminServiceClient();
    const { id: productId } = await params;
    const parsed = reorderSchema.safeParse(await request.json());
    if (!parsed.success || parsed.data.images.filter((image) => image.isMain).length > 1) {
      return NextResponse.json({ error: "Nieprawidłowa lista zdjęć" }, { status: 400 });
    }

    const ids = parsed.data.images.map((image) => image.id);
    const { data: owned, error: ownershipError } = await db
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .in("id", ids);
    if (ownershipError) throw ownershipError;
    if ((owned || []).length !== ids.length) {
      return NextResponse.json({ error: "Zdjęcie nie należy do produktu" }, { status: 400 });
    }

    const { error: clearError } = await db
      .from("product_images")
      .update({ is_main: false })
      .eq("product_id", productId);
    if (clearError) throw clearError;

    for (const image of parsed.data.images) {
      const { error } = await db
        .from("product_images")
        .update({
          position: image.position,
          is_main: image.isMain,
          ...(image.alt !== undefined ? { alt: image.alt } : {}),
        })
        .eq("id", image.id)
        .eq("product_id", productId);
      if (error) throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return adminAuthErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const db = adminServiceClient();
    const { id: productId } = await params;
    const imageId = request.nextUrl.searchParams.get("imageId");
    if (!imageId) {
      return NextResponse.json({ error: "Brak imageId" }, { status: 400 });
    }
    const { data: image, error: findError } = await db
      .from("product_images")
      .select("id,path")
      .eq("id", imageId)
      .eq("product_id", productId)
      .maybeSingle();
    if (findError) throw findError;
    if (!image) return NextResponse.json({ error: "Nie znaleziono zdjęcia" }, { status: 404 });
    if (image.path) {
      const { error: storageError } = await db.storage
        .from("product-images")
        .remove([image.path]);
      if (storageError) throw storageError;
    }
    const { error } = await db.from("product_images").delete().eq("id", image.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return adminAuthErrorResponse(error);
  }
}
