/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BedDouble,
  Check,
  ChevronRight,
  MessageCircle,
  Phone,
  Ruler,
  Users,
} from "lucide-react";
import { Gallery } from "@/components/gallery";
import { ProductCard } from "@/components/product-card";
import { salesContacts } from "@/lib/contact";
import { getProduct, getProducts } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export async function generateStaticParams() {
  return (await getProducts()).map((product) => ({ slug: product.slug }));
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  const specification = product.area ? ` — ${product.area} m²` : "";
  const tax = product.priceNet ? " netto" : "";
  return {
    title: `${product.name}${specification}, cena od ${formatPrice(product.priceFrom)}${tax}`,
    description: product.shortDescription,
    alternates: { canonical: `/modele/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [product.images[0]?.url],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const related = (await getProducts())
    .filter((candidate) => candidate.id !== product.id)
    .slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.images.map((image) => image.url),
    brand: { "@type": "Brand", name: "MODULA" },
    offers: {
      "@type": "Offer",
      price: product.priceFrom,
      priceCurrency: "PLN",
      availability: "https://schema.org/InStock",
      ...(product.priceNet
        ? {
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: product.priceNet,
              priceCurrency: "PLN",
              valueAddedTaxIncluded: false,
            },
          }
        : {}),
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container flex items-center gap-2 py-5 text-xs text-[#777]">
        <Link href="/">Strona główna</Link>
        <ChevronRight size={13} />
        <Link href="/modele">Modele</Link>
        <ChevronRight size={13} />
        <span className="truncate text-[#171916]">{product.name}</span>
      </div>
      <section className="container grid gap-9 lg:grid-cols-[1.45fr_.55fr]">
        <Gallery images={product.images} />
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow">{product.category}</p>
          <h1 className="display mt-3 text-5xl sm:text-6xl">{product.name}</h1>
          <p className="mt-5 text-sm leading-7 text-[#666b63]">
            {product.shortDescription}
          </p>
          <div className="mt-7 grid grid-cols-3 border-y border-[#dedfd9] py-5">
            <span>
              <Ruler size={18} />
              <b className="mt-2 block text-sm sm:text-base">
                {product.area ? `${product.area} m²` : "Na zamówienie"}
              </b>
              <small className="text-[#777]">powierzchnia</small>
            </span>
            <span>
              <Users size={18} />
              <b className="mt-2 block text-sm sm:text-base">
                {product.rooms || "Do ustalenia"}
              </b>
              <small className="text-[#777]">pomieszczenia</small>
            </span>
            <span>
              <BedDouble size={18} />
              <b className="mt-2 block text-sm sm:text-base">
                {product.bedrooms || "Do ustalenia"}
              </b>
              <small className="text-[#777]">sypialnie</small>
            </span>
          </div>
          <div className="mt-6">
            <small className="uppercase tracking-wider text-[#777]">
              {product.priceNet ? "Cena za prezentowany domek" : "Cena od"}
            </small>
            <strong className="mt-1 block text-3xl">
              {formatPrice(product.priceFrom)}
            </strong>
            <small className="text-[#777]">
              {product.priceNet ? "netto" : "brutto · cena bazowa"}
            </small>
          </div>
          <Link
            href={`/wycena?model=${product.slug}`}
            className="btn btn-dark mt-7 w-full"
          >
            Poproś o wycenę <ArrowRight size={16} />
          </Link>
          <Link href="/konfigurator" className="btn btn-outline mt-3 w-full">
            Skonfiguruj
          </Link>
          <div className="mt-5 border border-[#dedfd9] bg-[#f7f7f3] p-4">
            <p className="text-xs font-bold uppercase tracking-wider">
              Zapytaj o ten model
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {salesContacts.map((contact) => (
                <div key={contact.name} className="border bg-white p-3">
                  <span className="text-xs text-[#777]">{contact.name}</span>
                  <a
                    className="mt-1 flex items-center gap-2 text-sm font-bold"
                    href={contact.phoneHref}
                  >
                    <Phone size={14} /> {contact.phoneDisplay}
                  </a>
                  <a
                    className="mt-2 flex items-center gap-2 text-xs font-bold text-[#4f6043]"
                    href={contact.whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
      <section className="section">
        <div className="container grid gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow">O modelu</p>
            <h2 className="display mt-4 text-5xl">Gotowy do użytkowania</h2>
            <p className="mt-6 text-sm leading-8 text-[#666b63]">
              {product.description}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-5">Parametry techniczne</p>
            <dl className="border-t border-[#dedfd9]">
              {product.parameters.map((parameter) => (
                <div
                  key={parameter.name}
                  className="grid grid-cols-2 border-b border-[#dedfd9] py-4 text-sm"
                >
                  <dt className="text-[#666b63]">{parameter.name}</dt>
                  <dd className="font-bold">
                    {parameter.value} {parameter.unit}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
      <section className="section bg-[#f1f0eb]">
        <div className="container">
          <p className="eyebrow">W cenie</p>
          <h2 className="display mt-4 text-5xl">Wyposażenie modułu</h2>
          <div className="mt-10 grid gap-px bg-[#d7d8d1] md:grid-cols-3">
            {Object.entries(product.features).map(([category, items]) => (
              <div className="bg-[#f1f0eb] p-7" key={category}>
                <h3 className="text-lg font-bold">{category}</h3>
                <ul className="mt-5 space-y-3">
                  {(items as any[]).map((item: any) => (
                    <li
                      className="flex gap-2 text-sm text-[#555]"
                      key={typeof item === "string" ? item : item.name}
                    >
                      <Check size={16} className="shrink-0 text-[#68715a]" />
                      {typeof item === "string" ? item : item.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      {product.variants.length > 0 && (
        <section className="section">
          <div className="container">
            <p className="eyebrow">Standard wykończenia</p>
            <h2 className="display mt-4 text-5xl">Wybierz swój wariant</h2>
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {product.variants.map((variant, index) => (
                <div
                  className={`border p-7 ${index === 1 ? "border-[#68715a] bg-[#f1f3ed]" : "border-[#dedfd9]"}`}
                  key={variant.name}
                >
                  {index === 1 && <span className="eyebrow">Najczęściej wybierany</span>}
                  <h3 className="mt-4 text-2xl font-bold">{variant.name}</h3>
                  <p className="mt-3 min-h-12 text-sm text-[#666b63]">
                    {variant.description}
                  </p>
                  <strong className="mt-8 block text-xl">
                    od {formatPrice(variant.price)}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="section bg-[#f5f4ef]">
        <div className="container">
          <h2 className="display text-5xl">Zobacz także</h2>
          <div className="mt-9 grid gap-6 md:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
