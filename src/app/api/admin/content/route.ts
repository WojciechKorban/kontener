import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  adminAuthErrorResponse,
  adminServiceClient,
  requireAdmin,
} from "@/lib/admin-auth";

const requestSchema = z
  .object({
    resource: z.enum(["kategorie", "realizacje", "faq", "tresci", "ustawienia"]),
  })
  .passthrough();

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
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
    }
    const body = parsed.data;
    let error;

    if (body.resource === "kategorie") {
      const name = String(body.name || "").trim().slice(0, 100);
      if (name.length < 2) {
        return NextResponse.json({ error: "Nazwa jest wymagana" }, { status: 400 });
      }
      ({ error } = await db.from("categories").insert({
        name,
        slug: slugify(String(body.slug || name)),
      }));
    } else if (body.resource === "realizacje") {
      const name = String(body.name || "").trim().slice(0, 160);
      if (name.length < 2) {
        return NextResponse.json({ error: "Nazwa jest wymagana" }, { status: 400 });
      }
      ({ error } = await db.from("realizations").insert({
        name,
        slug: slugify(`${name}-${String(body.location || Date.now())}`),
        location: String(body.location || "").slice(0, 160) || null,
        year: Number(body.year) || null,
        description: String(body.description || "").slice(0, 10000),
        status: "PUBLISHED",
      }));
    } else if (body.resource === "faq") {
      const question = String(body.question || "").trim().slice(0, 300);
      const answer = String(body.answer || "").trim().slice(0, 5000);
      if (!question || !answer) {
        return NextResponse.json(
          { error: "Pytanie i odpowiedź są wymagane" },
          { status: 400 },
        );
      }
      ({ error } = await db.from("faq").insert({ question, answer, visible: true }));
    } else {
      const key = slugify(String(body.key || ""));
      if (!key) {
        return NextResponse.json({ error: "Klucz jest wymagany" }, { status: 400 });
      }
      ({ error } = await db.from("settings").upsert({
        key,
        value: { content: String(body.value || "").slice(0, 20000) },
      }));
    }

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return adminAuthErrorResponse(error);
  }
}
