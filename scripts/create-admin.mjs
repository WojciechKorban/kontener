import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const required = [
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`Brak wymaganych zmiennych: ${missing.join(", ")}`);
  process.exit(1);
}

const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (password.length < 12) {
  console.error("ADMIN_PASSWORD musi mieć co najmniej 12 znaków.");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function findUserByEmail() {
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw error;
    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === email,
    );
    if (user) return user;
    if (data.users.length < 1000) return null;
    page += 1;
  }
}

try {
  let user = await findUserByEmail();

  if (user) {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, role: "admin" }, { onConflict: "id" });
  if (profileError) throw profileError;

  console.log("Administrator jest gotowy.");
  console.log(`E-mail: ${email}`);
  console.log("Hasło nie zostało wypisane. Jest pobierane z ADMIN_PASSWORD.");
} catch (error) {
  console.error("Nie udało się utworzyć administratora:", error.message);
  process.exit(1);
}
