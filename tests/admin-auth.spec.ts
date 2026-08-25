import { expect, test } from "@playwright/test";

const adminReady = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.E2E_ADMIN_EMAIL &&
    process.env.E2E_ADMIN_PASSWORD,
);

const nonAdminReady = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.E2E_NON_ADMIN_EMAIL &&
    process.env.E2E_NON_ADMIN_PASSWORD,
);

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Hasło").fill(password);
  await page.getByRole("button", { name: "Zaloguj się" }).click();
}

test.describe("administrator z prawdziwą sesją Supabase", () => {
  test.skip(!adminReady, "Wymaga danych E2E administratora i testowego Supabase");

  test("loguje się, tworzy draft, publikuje, archiwizuje i wylogowuje", async ({ page }) => {
    await login(
      page,
      process.env.E2E_ADMIN_EMAIL!,
      process.env.E2E_ADMIN_PASSWORD!,
    );
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText("Panel administratora")).toBeVisible();

    const unique = Date.now();
    const response = await page.request.post("/api/admin/products", {
      multipart: {
        name: `E2E MODEL ${unique}`,
        slug: `e2e-model-${unique}`,
        category: "Testowe",
        area: "20",
        priceFrom: "100000",
        shortDescription: "Model utworzony automatycznie w teście autoryzacji.",
        description: "Produkt testowy przeznaczony do automatycznego usunięcia.",
        status: "DRAFT",
        parameters: "[]",
        features: "[]",
        mainImage: "0",
      },
    });
    expect(response.status()).toBe(200);
    const product = await response.json();

    const publish = await page.request.patch(`/api/admin/products/${product.id}`, {
      data: { status: "PUBLISHED" },
    });
    expect(publish.status()).toBe(200);

    const archive = await page.request.patch(`/api/admin/products/${product.id}`, {
      data: { status: "ARCHIVED" },
    });
    expect(archive.status()).toBe(200);

    const remove = await page.request.delete(`/api/admin/products/${product.id}`);
    expect(remove.status()).toBe(200);

    await page.getByRole("button", { name: "Wyloguj się" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe("konto bez roli administratora", () => {
  test.skip(!nonAdminReady, "Wymaga danych E2E zwykłego użytkownika Supabase");

  test("widzi komunikat i otrzymuje 403 z API", async ({ page }) => {
    await login(
      page,
      process.env.E2E_NON_ADMIN_EMAIL!,
      process.env.E2E_NON_ADMIN_PASSWORD!,
    );
    await expect(
      page.getByText("To konto nie ma uprawnień administratora."),
    ).toBeVisible();
    const response = await page.request.patch(
      "/api/admin/products/00000000-0000-0000-0000-000000000000",
      { data: { status: "ARCHIVED" } },
    );
    expect(response.status()).toBe(403);
  });
});
