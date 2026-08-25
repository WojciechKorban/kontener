"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!configured) {
      setError("Najpierw skonfiguruj Supabase w zmiennych środowiskowych.");
      return;
    }

    setLoading(true);
    const form = new FormData(event.currentTarget);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    if (signInError || !data.user) {
      setError("Nieprawidłowy e-mail lub hasło.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      setError("To konto nie ma uprawnień administratora.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={login} className="mt-8 space-y-5">
      <label className="block text-xs font-bold uppercase tracking-wider">
        E-mail
        <input className="field mt-2" name="email" type="email" required />
      </label>
      <label className="block text-xs font-bold uppercase tracking-wider">
        Hasło
        <input className="field mt-2" name="password" type="password" required />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button className="btn btn-dark w-full" disabled={loading || !configured}>
        {loading && <Loader2 size={16} className="animate-spin" />}
        Zaloguj się
      </button>
    </form>
  );
}
