# MODULA — domy i kontenery modułowe

Gotowa do wdrożenia aplikacja producenta obiektów modułowych. Jeden projekt Next.js obsługuje stronę publiczną, SEO, API formularzy i prosty panel CMS. Bez skonfigurowanego Supabase publiczna witryna działa z sześcioma modelami demonstracyjnymi, ale panel i wszystkie zapisy administracyjne pozostają zablokowane.

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

Otwórz `http://localhost:3000`. Bez kluczy zewnętrznych działają strona, katalog, galerie, konfigurator i publiczny formularz w trybie demonstracyjnym. Panel celowo nie pozwala się zalogować bez kompletnej konfiguracji Supabase.

## Konfiguracja Supabase

1. Utwórz nowy projekt na Supabase.
2. W SQL Editor uruchom kolejno `supabase/migrations/001_initial.sql`, `supabase/migrations/002_harden_admin_auth.sql` i `supabase/seed.sql`.
3. Migracja tworzy tabele, enumy, indeksy, RLS oraz buckety `product-images`, `realization-images` i prywatny `inquiry-attachments`.
4. Skopiuj URL, klucz anon oraz service role do `.env.local`. Klucza service role nigdy nie prefiksuj `NEXT_PUBLIC_`.
5. W Auth → URL Configuration ustaw adres produkcyjny oraz `http://localhost:3000`.

## Utworzenie administratora

Uzupełnij lokalny `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAIL=admin@modula.local
ADMIN_PASSWORD=ModulaAdmin!2026
```

Następnie wykonaj:

```bash
npm run create:admin
npm run dev
```

Skrypt `scripts/create-admin.mjs` używa Supabase Admin API, potwierdza adres e-mail i przypisuje dokładną rolę `admin`. Jest idempotentny: kolejne uruchomienie aktualizuje to samo konto oraz ustawia hasło z `ADMIN_PASSWORD`, zamiast tworzyć duplikat.

## Dodanie oferty „DOMEK SAUNA”

Oferta z ceną 140 000 zł netto, wyposażeniem pod klucz, sauną, klimatyzacją i rekuperacją jest częścią danych demonstracyjnych oraz `supabase/seed.sql`. Jeśli baza została już wcześniej utworzona, dodaj lub zaktualizuj ofertę bez duplikatów poleceniem:

```bash
npm run seed:container-sauna
```

Polecenie wymaga `NEXT_PUBLIC_SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY` w `.env.local`. Nieznane wymiary i powierzchnia pozostają puste. Skrypt dodaje tymczasową wizualizację z `public/images/hero-modular.png` tylko wtedy, gdy produkt nie ma jeszcze żadnego zdjęcia. Po zalogowaniu podmień ją w panelu na rzeczywiste fotografie ogłoszenia.

Panel lokalny:

```text
http://localhost:3000/admin/login
```

Testowe dane:

```text
E-mail: admin@modula.local
Hasło: ModulaAdmin!2026
```

> **Ważne:** powyższe hasło służy wyłącznie do lokalnych testów. Przed publicznym wdrożeniem ustaw własne, unikalne i silne `ADMIN_PASSWORD`, ponownie uruchom `npm run create:admin`, usuń hasło z historii terminala i nie zapisuj go w Git.

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

Testy bez zewnętrznej bazy obejmują katalog, galerię, formularz wyceny oraz zachowanie fail-closed panelu i API. Pełne testy administratora uruchamiają się, gdy środowisko testowe ma ustawione `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `E2E_ADMIN_EMAIL` i `E2E_ADMIN_PASSWORD`.

## Deployment: GitHub → Vercel → Supabase

1. Umieść repozytorium na GitHubie i zaimportuj je w Vercel.
2. Dodaj wartości aplikacyjne z `.env.example` w Project Settings → Environment Variables. `ADMIN_PASSWORD` jest potrzebne tylko podczas uruchamiania skryptu tworzącego konto i nie musi pozostawać w Vercel.
3. Ustaw `NEXT_PUBLIC_SITE_URL` na docelową domenę.
4. Wdróż projekt. Vercel automatycznie rozpozna Next.js.
5. Dodaj domenę Vercel do dozwolonych redirect URLs w Supabase Auth.

### Logowanie bez konta Vercel

Administrator loguje się bezpośrednio na stronie pod adresem:

```text
https://twoja-domena.pl/admin/login
```

Do logowania służy konto utworzone przez `npm run create:admin` w Supabase Auth — konto Vercel nie jest potrzebne. Produkcyjny deployment musi być publiczny. W ustawieniach projektu Vercel wyłącz ochronę wymagającą logowania Vercel dla środowiska Production (Deployment Protection / Vercel Authentication). Ochronę podglądów Preview możesz pozostawić włączoną. Zmiana tej opcji odbywa się w panelu Vercel i nie może być wymuszona przez kod aplikacji.

Obrazy produktowe są serwowane z Supabase Storage, a `next/image` generuje właściwe rozmiary i formaty dla list oraz galerii. Nowo opublikowany produkt trafia automatycznie do katalogu, własnego URL i dynamicznej sitemapy — bez zmian w kodzie i redeployu.

## Deployment na Netlify

Repozytorium zawiera `netlify.toml`, dlatego Netlify powinien użyć następujących ustawień bez dodatkowych pluginów i redirectów:

```text
Base directory:     puste
Build command:      npm run build
Publish directory:  .next
Node.js:            22
```

Projekt korzysta z App Routera, Route Handlers, middleware/proxy, SSR i Supabase Auth, dlatego nie używa `output: "export"`. Nie dodawaj reguły `/* -> /index.html`; routing Next.js jest obsługiwany automatycznie przez aktualny Netlify Next.js Runtime.

Skrypt `npm run build` używa wspieranego trybu webpack (`next build --webpack`), który generuje standardowy katalog `.next` zgodny z Netlify. Nie zmienia to sposobu działania SSR, Route Handlers ani routingu aplikacji.

W Netlify przejdź do **Project configuration → Environment variables** i ustaw przynajmniej:

```env
NEXT_PUBLIC_SITE_URL=https://nazwa-projektu.netlify.app
NEXT_PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Zmienne Supabase są potrzebne do działania panelu administratora. Publiczna witryna uruchomi się również bez nich, korzystając z danych demonstracyjnych. Dla wysyłki e-mail dodaj opcjonalnie `RESEND_API_KEY`, `RESEND_FROM` i `INQUIRY_EMAIL`. Po zmianie zmiennych uruchom **Clear cache and deploy site**. Nie ustawiaj `NETLIFY_NEXT_PLUGIN_SKIP` i nie instaluj ręcznie starego `@netlify/plugin-nextjs`.

## Bezpieczeństwo

Panel jest chroniony sesją Supabase Auth i dokładną rolą `admin` przez `src/proxy.ts`. Każdy administracyjny Route Handler ponownie wywołuje serwerowe `requireAdmin()`: brak konfiguracji daje 503, brak sesji 401, a konto bez roli administratora 403. Nie istnieje demonstracyjne obejście zabezpieczeń.

RLS pozwala publicznie czytać tylko opublikowane produkty i realizacje, widoczne FAQ oraz związane z nimi media. Zapytania, notatki i prywatne załączniki są dostępne wyłącznie administratorowi. Service role jest importowane tylko przez moduły oznaczone `server-only`. Upload ma allowlistę MIME, limit rozmiaru i limit liczby plików, a formularz publiczny ma honeypot, walidację Zod i prosty rate limit.

Wylogowanie jest dostępne w bocznym menu panelu. Po wylogowaniu sesja zostaje usunięta, a ponowne wejście do `/admin` przekierowuje na `/admin/login`.

W produkcji warto zastąpić pamięciowy rate limit integracją Vercel Firewall lub Upstash Redis przy większym ruchu.
