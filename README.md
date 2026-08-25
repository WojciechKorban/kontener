# MODULA — domy i kontenery modułowe

Gotowa do wdrożenia aplikacja producenta obiektów modułowych. Jeden projekt Next.js obsługuje stronę publiczną, SEO, API formularzy i prosty panel CMS. Bez skonfigurowanego Supabase działa bezpieczny tryb demonstracyjny z sześcioma modelami; po podaniu zmiennych środowiskowych dane są pobierane z PostgreSQL.

## Architektura

```text
src/app/              App Router, strony, sitemap, robots i Route Handlers
src/components/       publiczny UI, katalog, galeria, formularze i CMS
src/lib/              typy, repozytorium danych, klient Supabase, demo seed
supabase/migrations/  relacyjny model, RLS, policies i Storage buckets
supabase/seed.sql      sześć produktów demonstracyjnych
tests/                najważniejsze scenariusze Playwright
public/images/        zoptymalizowane przez Next/Image materiały demo
```

## Uruchomienie lokalne

Wymagany jest Node.js 20.19+, 22.13+ lub 24 LTS.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Otwórz `http://localhost:3000`. Bez kluczy zewnętrznych strona, katalog, galerie, konfigurator, formularz w trybie demo i panel działają lokalnie.

## Konfiguracja Supabase

1. Utwórz nowy projekt na Supabase.
2. W SQL Editor uruchom kolejno `supabase/migrations/001_initial.sql` i `supabase/seed.sql`.
3. Migracja tworzy tabele, enumy, indeksy, RLS oraz buckety `product-images`, `realization-images` i prywatny `inquiry-attachments`.
4. W Authentication utwórz użytkownika administratora.
5. Dodaj jego UUID do tabeli `profiles`: `insert into profiles(id, role) values ('UUID_UŻYTKOWNIKA', 'admin');`.
6. Skopiuj URL, klucz anon oraz service role do `.env.local`. Klucza service role nigdy nie prefiksuj `NEXT_PUBLIC_`.
7. W Auth → URL Configuration ustaw adres produkcyjny oraz `http://localhost:3000`.

## E-mail

Utwórz klucz Resend, zweryfikuj domenę i ustaw `RESEND_API_KEY`, `RESEND_FROM` oraz `INQUIRY_EMAIL`. Bez Resend zapytanie nadal zapisuje się w bazie, ale e-mail jest pomijany.

## Testy i kontrola jakości

```bash
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Testy obejmują katalog i filtrowanie, stronę produktu i galerię, formularz wyceny oraz wejście w workflow dodawania produktu.

## Deployment: GitHub → Vercel → Supabase

1. Umieść repozytorium na GitHubie i zaimportuj je w Vercel.
2. Dodaj wszystkie wartości z `.env.example` w Project Settings → Environment Variables.
3. Ustaw `NEXT_PUBLIC_SITE_URL` na docelową domenę.
4. Wdróż projekt. Vercel automatycznie rozpozna Next.js.
5. Dodaj domenę Vercel do dozwolonych redirect URLs w Supabase Auth.

Obrazy produktowe są serwowane z Supabase Storage, a `next/image` generuje właściwe rozmiary i formaty dla list oraz galerii. Nowo opublikowany produkt trafia automatycznie do katalogu, własnego URL i dynamicznej sitemapy — bez zmian w kodzie i redeployu.

## Bezpieczeństwo

Panel jest chroniony sesją Supabase Auth przez `src/proxy.ts`. Zapisy administracyjne są dodatkowo weryfikowane w Route Handlerach, RLS rozdziela publiczny odczyt od operacji administratora, upload ma allowlistę MIME i limity, formularz ma honeypot, walidację Zod i prosty rate limit. W produkcji warto zastąpić pamięciowy rate limit integracją Vercel Firewall lub Upstash Redis przy większym ruchu.
