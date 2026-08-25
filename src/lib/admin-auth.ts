import "server-only";

import { createClient, type User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { hasSupabaseConfig, serverSupabase } from "./supabase-server";

export class AdminAuthError extends Error {
  constructor(
    public readonly status: 401 | 403 | 503,
    message: string,
  ) {
    super(message);
    this.name = "AdminAuthError";
  }
}

export async function requireAdmin(): Promise<User> {
  if (!hasSupabaseConfig()) {
    throw new AdminAuthError(503, "Panel administratora nie jest skonfigurowany.");
  }

  const supabase = await serverSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new AdminAuthError(401, "Wymagane jest zalogowanie.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    throw new AdminAuthError(403, "Konto nie ma uprawnień administratora.");
  }

  return user;
}

export function adminServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new AdminAuthError(503, "Serwerowa konfiguracja Supabase jest niepełna.");
  }
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function adminAuthErrorResponse(error: unknown) {
  if (error instanceof AdminAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("admin_auth_error", error);
  return NextResponse.json({ error: "Błąd autoryzacji" }, { status: 500 });
}
