const LOCAL_SITE_URL = "http://localhost:3000";

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || LOCAL_SITE_URL;

  try {
    return new URL(configuredUrl).origin;
  } catch {
    console.warn(
      "Nieprawidłowy NEXT_PUBLIC_SITE_URL. Używam adresu lokalnego do metadanych.",
    );
    return LOCAL_SITE_URL;
  }
}
