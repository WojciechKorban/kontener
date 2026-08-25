import { NextRequest, NextResponse } from "next/server";
import {
  adminAuthErrorResponse,
  adminServiceClient,
  requireAdmin,
} from "@/lib/admin-auth";

const statuses = new Set(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const db = adminServiceClient();
    const { id } = await params;
    const body = await request.json();
    if (body.status && !statuses.has(body.status)) {
      return NextResponse.json({ error: "Nieprawidłowy status" }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    for (const key of ["name", "slug", "short_description", "description", "status"]) {
      if (typeof body[key] === "string") {
        update[key] = String(body[key]).slice(0, key === "description" ? 10000 : 500);
      }
    }
    for (const key of ["area", "price_from"]) {
      if (body[key] !== undefined && Number.isFinite(Number(body[key]))) {
        update[key] = Number(body[key]);
      }
    }
    if (body.status === "PUBLISHED") update.published_at = new Date().toISOString();

    const { error } = await db.from("products").update(update).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return adminAuthErrorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const db = adminServiceClient();
    const { id } = await params;
    const { error } = await db.from("products").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return adminAuthErrorResponse(error);
  }
}
