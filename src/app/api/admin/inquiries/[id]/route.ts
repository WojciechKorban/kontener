import { NextRequest, NextResponse } from "next/server";
import {
  adminAuthErrorResponse,
  adminServiceClient,
  requireAdmin,
} from "@/lib/admin-auth";

const statuses = new Set([
  "NEW",
  "CONTACTED",
  "OFFER_PREPARATION",
  "OFFER_SENT",
  "WON",
  "LOST",
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const db = adminServiceClient();
    const { id } = await params;
    const { status } = await request.json();
    if (!statuses.has(status)) {
      return NextResponse.json({ error: "Nieprawidłowy status" }, { status: 400 });
    }
    const { error } = await db.from("inquiries").update({ status }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return adminAuthErrorResponse(error);
  }
}
