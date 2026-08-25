import { LoginForm } from "@/components/login-form";
import { hasAdminConfig } from "@/lib/supabase-server";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const configured = hasAdminConfig();
  const { error } = await searchParams;

  return (
    <main className="w-full max-w-md border bg-white p-5 shadow-[0_24px_80px_rgba(23,25,22,.08)] sm:p-8">
      <p className="eyebrow">Bezpieczny panel</p>
      <h1 className="display mt-4 text-5xl sm:text-6xl">Logowanie</h1>
      <p className="mt-4 text-sm text-[#777]">
        Zaloguj się kontem administratora Supabase.
      </p>
      {(!configured || error === "configuration") && (
        <p className="mt-5 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Panel jest zablokowany, dopóki nie skonfigurujesz Supabase i konta
          administratora.
        </p>
      )}
      <LoginForm configured={configured} />
    </main>
  );
}
