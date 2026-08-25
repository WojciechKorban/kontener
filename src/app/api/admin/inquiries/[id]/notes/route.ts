import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  adminAuthErrorResponse,
  adminServiceClient,
  requireAdmin,
} from "@/lib/admin-auth";

const schema = z.object({ note: z.string().trim().min(1).max(5000) });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin();
    const db = adminServiceClient();
    const { id: inquiryId } = await params;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Nieprawidłowa notatka" }, { status: 400 });
    }
    const { data, error } = await db
      .from("inquiry_notes")
      .insert({ inquiry_id: inquiryId, author_id: user.id, note: parsed.data.note })
      .select("id, note, created_at")
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return adminAuthErrorResponse(error);
  }
}
