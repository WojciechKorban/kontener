import type { Metadata } from "next";
import { Manrope, Cormorant_Garamond } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MobileBar } from "@/components/mobile-bar";
import { salesContacts } from "@/lib/contact";
import "./globals.css";

const sans = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });
const serif = Cormorant_Garamond({ subsets: ["latin", "latin-ext"], variable: "--font-serif", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "MODULA — Kontenery mieszkalne i domy modułowe", template: "%s | MODULA" },
  description: "Producent nowoczesnych kontenerów mieszkalnych, biurowych i użytkowych. Projekt, produkcja, transport i montaż w całej Polsce.",
  keywords: ["kontenery mieszkalne", "domy modułowe", "kontenery całoroczne", "kontenery pod klucz", "producent kontenerów"],
  openGraph: { title: "MODULA — Nowoczesne kontenery. Gotowe do życia.", description: "Domy modułowe i kontenery pod klucz.", images: ["/images/hero-modular.png"], locale: "pl_PL", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: "MODULA", url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", logo: "/favicon.ico", contactPoint: salesContacts.map(contact=>({ "@type": "ContactPoint", telephone: contact.phoneDisplay, contactType: "sales", areaServed: "PL" })) };
  return <html lang="pl" data-scroll-behavior="smooth" className={`${sans.variable} ${serif.variable}`}><body style={{ fontFamily: "var(--font-sans)" }}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}/><Header />{children}<Footer /><MobileBar /></body></html>;
}
