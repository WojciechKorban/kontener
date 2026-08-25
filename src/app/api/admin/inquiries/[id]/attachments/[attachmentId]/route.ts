import { NextRequest, NextResponse } from "next/server";
import {
  adminAuthErrorResponse,
  adminServiceClient,
  requireAdmin,
} from "@/lib/admin-auth";

export async function GET(
  _request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; attachmentId: string }> },
) {
  try {
    await requireAdmin();
    const db = adminServiceClient();
    const { id: inquiryId, attachmentId } = await params;
    const { data: attachment, error } = await db
      .from("inquiry_attachments")
      .select("path")
      .eq("id", attachmentId)
      .eq("inquiry_id", inquiryId)
      .maybeSingle();
    if (error) throw error;
    if (!attachment) {
      return NextResponse.json({ error: "Nie znaleziono załącznika" }, { status: 404 });
    }
    const signed = await db.storage
      .from("inquiry-attachments")
      .createSignedUrl(attachment.path, 60);
    if (signed.error) throw signed.error;
    return NextResponse.redirect(signed.data.signedUrl);
  } catch (error) {
    return adminAuthErrorResponse(error);
  }
}
