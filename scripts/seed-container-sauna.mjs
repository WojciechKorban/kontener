import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`Brak wymaganych zmiennych: ${missing.join(", ")}`);
  process.exit(1);
}

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const slug = "domek-sauna-kontener-morski";
const parameters = [
  ["Stan", "Nowy, nieużywany", null],
  ["Wykończenie", "Pod klucz", null],
  ["Konstrukcja", "Kontener morski", null],
  ["Izolacja", "Piana PUR", null],
  ["Okna", "Trzyszybowe", null],
  ["Ogrzewanie", "Podłogowe elektryczne", null],
  ["Wentylacja", "Rekuperator", null],
  ["Klimatyzacja", "Klimatyzator", null],
];
const features = {
  Wnętrze: [
    "Salon z kuchnią",
    "Sypialnia",
    "Wodoodporne panele winylowe w sypialni i kuchni",
  ],
  Kuchnia: ["Zmywarka", "Lodówka", "Filtr wody"],
  Łazienka: ["Łazienka z prysznicem"],
  Sauna: ["Sauna", "Piec elektryczny"],
  Instalacje: [
    "Klimatyzator",
    "Rekuperator",
    "Elektryczne ogrzewanie podłogowe",
  ],
};

try {
  let { data: category, error: categoryReadError } = await db
    .from("categories")
    .select("id")
    .eq("slug", "mieszkalne")
    .maybeSingle();
  if (categoryReadError) throw categoryReadError;

  if (!category) {
    const { data, error } = await db
      .from("categories")
      .insert({ name: "Mieszkalne", slug: "mieszkalne", position: 1 })
      .select("id")
      .single();
    if (error) throw error;
    category = data;
  }

  const { data: product, error: productError } = await db
    .from("products")
    .upsert(
      {
        category_id: category.id,
        name: "DOMEK SAUNA",
        slug,
        short_description:
          "Nowy, nieużywany domek z kontenera morskiego, wykończony pod klucz i wyposażony w prywatną saunę.",
        description:
          "Gotowy domek z kontenera morskiego z salonem i kuchnią, sypialnią, łazienką z prysznicem oraz sauną z piecem elektrycznym. Obiekt jest ocieplony pianą PUR i posiada kompletne wyposażenie opisane w ofercie. Realizujemy także zamówienia indywidualne: inne wielkości, układy pomieszczeń, łączenie kilku kontenerów oraz zabudowę wielokondygnacyjną.",
        price_net: 140000,
        price_from: 140000,
        price_visible: true,
        area: null,
        dimensions: null,
        rooms: 0,
        bedrooms: 1,
        purpose: ["mieszkanie", "rekreacja", "sauna"],
        featured: true,
        status: "PUBLISHED",
        published_at: new Date().toISOString(),
        meta_title: "Domek z kontenera morskiego z sauną — pod klucz",
        meta_description:
          "Nowy domek z kontenera morskiego z kuchnią, łazienką, sauną, klimatyzacją i rekuperacją. Cena 140 000 zł netto.",
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (productError) throw productError;

  const relatedTables = ["product_parameters", "product_features"];
  for (const table of relatedTables) {
    const { error } = await db.from(table).delete().eq("product_id", product.id);
    if (error) throw error;
  }

  const { error: parametersError } = await db
    .from("product_parameters")
    .insert(
      parameters.map(([name, value, unit], position) => ({
        product_id: product.id,
        name,
        value,
        unit,
        position,
      })),
    );
  if (parametersError) throw parametersError;

  const featureRows = Object.entries(features).flatMap(([categoryName, items]) =>
    items.map((name, position) => ({
      product_id: product.id,
      category: categoryName,
      name,
      position,
    })),
  );
  const { error: featuresError } = await db
    .from("product_features")
    .insert(featureRows);
  if (featuresError) throw featuresError;

  const { count, error: imageReadError } = await db
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", product.id);
  if (imageReadError) throw imageReadError;

  if (!count) {
    const { error: imageError } = await db.from("product_images").insert({
      product_id: product.id,
      url: "/images/hero-modular.png",
      alt: "Tymczasowa wizualizacja domku z kontenera morskiego z sauną",
      position: 0,
      type: "EXTERIOR",
      is_main: true,
    });
    if (imageError) throw imageError;
  }

  console.log("Oferta DOMEK SAUNA jest gotowa.");
  console.log(`Slug: ${slug}`);
  console.log("Cena: 140 000 zł netto");
} catch (error) {
  console.error("Nie udało się dodać oferty:", error.message);
  process.exit(1);
}
