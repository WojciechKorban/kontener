import type { Product } from "./types";

const gallery = [
  { id: "g1", url: "/images/hero-modular.png", alt: "Nowoczesny moduł mieszkalny z elewacją drewnianą", position: 0, type: "EXTERIOR" as const, is_main: true },
  { id: "g2", url: "/images/modern-olive.png", alt: "Kompaktowy dom modułowy nad jeziorem", position: 1, type: "EXTERIOR" as const, is_main: false },
  { id: "g3", url: "/images/interior-oak.png", alt: "Salon z kuchnią w domu modułowym", position: 2, type: "INTERIOR" as const, is_main: false },
];
const baseParams = (area: number, dims: string) => [
  { name: "Powierzchnia użytkowa", value: String(area), unit: "m²" }, { name: "Wymiary", value: dims },
  { name: "Wysokość wewnętrzna", value: "2,65", unit: "m" }, { name: "Izolacja", value: "20", unit: "cm" },
  { name: "Konstrukcja", value: "Stalowa S350" }, { name: "Okna", value: "Trzyszybowe" },
];
const features = { Konstrukcja: ["Stalowa konstrukcja", "Zabezpieczenie antykorozyjne", "Izolacja całoroczna"], Wnętrze: ["Wykończone ściany", "Podłogi winylowe", "Oświetlenie LED"], Kuchnia: ["Meble na wymiar", "Blat i zlew", "Miejsce pod AGD"], Łazienka: ["Prysznic", "WC i umywalka", "Kompletna armatura"], Instalacje: ["Instalacja elektryczna", "Wod-kan", "Ogrzewanie"] };
const seed = [
  ["MODERN 20", "modern-20", "Rekreacyjne", 20, 89900, "6,0 × 3,35 m", 1, 0],
  ["LIVING 25", "living-25", "Mieszkalne", 25, 109000, "7,5 × 3,35 m", 2, 1],
  ["FAMILY 35", "family-35", "Całoroczne", 35, 149000, "10,5 × 3,35 m", 3, 1],
  ["FAMILY 50", "family-50", "Modułowe", 50, 219000, "12,0 × 4,2 m", 4, 2],
  ["OFFICE 30", "office-30", "Biurowe", 30, 119000, "9,0 × 3,35 m", 2, 0],
  ["BUSINESS 40", "business-40", "Usługowe", 40, 169000, "12,0 × 3,35 m", 3, 0],
] as const;
export const products: Product[] = seed.map((p, i) => ({
  id: `demo-${i + 1}`, name: p[0], slug: p[1], category: p[2], categorySlug: p[2].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), area: p[3], priceFrom: p[4], dimensions: p[5], rooms: p[6], bedrooms: p[7],
  shortDescription: i < 4 ? "Nowoczesny, całoroczny moduł z kompletnymi instalacjami i wykończeniem." : "Funkcjonalny moduł biznesowy gotowy do rozpoczęcia pracy.",
  description: "Przemyślany moduł zaprojektowany z myślą o komforcie, trwałości i szybkim uruchomieniu. Dostarczamy go na działkę jako gotowy lub prawie gotowy obiekt, z pełnymi instalacjami i wykończeniem dobranym do Twoich potrzeb.",
  purpose: i === 4 ? ["biuro"] : i === 5 ? ["usługi", "gastronomia"] : ["mieszkanie", "rekreacja"], featured: [1,2,3].includes(i), createdAt: `2026-0${i + 1}-01`, status: "PUBLISHED", images: gallery.map((x, n) => ({ ...x, id: `${i}-${n}`, is_main: n === 0, position: n, url: [x.url, "/images/modern-olive.png", "/images/interior-oak.png"][(n + i) % 3] })), parameters: baseParams(p[3], p[5]), features,
  variants: [{ name: "Standard", description: "Gotowy moduł z podstawowym wykończeniem", price: p[4] }, { name: "Comfort", description: "Rozszerzone wyposażenie i klimatyzacja", price: p[4] + 25000 }, { name: "Premium", description: "Wykończenie premium i system smart home", price: p[4] + 49000 }],
}));
export const categories = ["Wszystkie", "Mieszkalne", "Modułowe", "Biurowe", "Usługowe", "Gastronomiczne", "Rekreacyjne", "Całoroczne"];
export const faqs = [
  ["Ile trwa produkcja kontenera?", "Standardowy proces produkcji zajmuje zwykle 8–12 tygodni od akceptacji projektu."],
  ["Czy kontenery są całoroczne?", "Tak. Modele całoroczne mają odpowiednią izolację, szczelną stolarkę oraz wydajne ogrzewanie."],
  ["Czy pomagacie w transporcie i montażu?", "Tak, organizujemy transport HDS, posadowienie i uruchomienie obiektu w całej Polsce."],
  ["Czy mogę zmienić układ pomieszczeń?", "Większość modeli można personalizować w zakresie ścian, okien, instalacji i wykończenia."],
];
