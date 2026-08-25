/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  adminAuthErrorResponse,
  adminServiceClient,
  requireAdmin,
} from "@/lib/admin-auth";

const productSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().max(140).optional(),
  category: z.string().min(2).max(100),
  area: z.coerce.number().positive(),
  priceFrom: z.coerce.number().nonnegative(),
  shortDescription: z.string().min(10).max(500),
  description: z.string().max(10000).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const db = adminServiceClient();
    const form = await request.formData();
    const parsed = productSchema.safeParse(
      Object.fromEntries(
        [...form.entries()].filter(
          ([key, value]) =>
            typeof value === "string" && !["parameters", "features"].includes(key),
        ),
      ),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const slug = slugify(parsed.data.slug || parsed.data.name);
    let { data: category } = await db
      .from("categories")
      .select("id")
      .eq("name", parsed.data.category)
      .maybeSingle();
    if (!category) {
      const result = await db
        .from("categories")
        .insert({ name: parsed.data.category, slug: slugify(parsed.data.category) })
        .select("id")
        .single();
      if (result.error) throw result.error;
      category = result.data;
    }

    const { data: product, error } = await db
      .from("products")
      .insert({
        name: parsed.data.name,
        slug,
        category_id: category?.id,
        area: parsed.data.area,
        price_from: parsed.data.priceFrom,
        short_description: parsed.data.shortDescription,
        description: parsed.data.description,
        status: parsed.data.status,
        published_at:
          parsed.data.status === "PUBLISHED" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();
    if (error) throw error;

    const parameters = JSON.parse(String(form.get("parameters") || "[]"));
    if (Array.isArray(parameters) && parameters.length) {
      const { error: parametersError } = await db
        .from("product_parameters")
        .insert(
          parameters.slice(0, 100).map((item: any, position: number) => ({
            product_id: product.id,
            name: String(item.name || "").slice(0, 120),
            value: String(item.value || "").slice(0, 300),
            unit: String(item.unit || "").slice(0, 30) || null,
            position,
          })),
        );
      if (parametersError) throw parametersError;
    }

    const features = JSON.parse(String(form.get("features") || "[]"));
    if (Array.isArray(features) && features.length) {
      const { error: featuresError } = await db.from("product_features").insert(
        features.slice(0, 100).map((name: unknown, position: number) => ({
          product_id: product.id,
          category: "Instalacje",
          name: String(name).slice(0, 160),
          position,
        })),
      );
      if (featuresError) throw featuresError;
    }

    const images = form
      .getAll("images")
      .filter((item): item is File => item instanceof File)
      .slice(0, 30);
    const mainImage = Number(form.get("mainImage") || 0);
    for (let position = 0; position < images.length; position += 1) {
      const file = images[position];
      if (file.size > 12 * 1024 * 1024 || !allowedImageTypes.has(file.type)) {
        return NextResponse.json({ error: "Nieprawidłowy plik obrazu" }, { status: 400 });
      }
      const path = `${product.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const upload = await db.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upload.error) throw upload.error;
      const publicUrl = db.storage.from("product-images").getPublicUrl(path).data
        .publicUrl;
      const { error: imageError } = await db.from("product_images").insert({
        product_id: product.id,
        url: publicUrl,
        path,
        alt: `${parsed.data.name} — zdjęcie ${position + 1}`,
        position,
        is_main: position === mainImage,
        type: "EXTERIOR",
      });
      if (imageError) throw imageError;
    }

    return NextResponse.json({ id: product.id, slug });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Nieprawidłowy JSON" }, { status: 400 });
    }
    const authResponse = adminAuthErrorResponse(error);
    if (authResponse.status !== 500) return authResponse;
    console.error("create_product_error", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
