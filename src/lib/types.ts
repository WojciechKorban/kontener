export type ProductImage = { id: string; url: string; alt: string; position: number; type: "EXTERIOR" | "INTERIOR" | "PLAN"; is_main: boolean };
export type Parameter = { name: string; value: string; unit?: string };
export type Product = {
  id: string; name: string; slug: string; category: string; categorySlug: string;
  shortDescription: string; description: string; priceFrom: number; priceNet?: number | null; area: number;
  dimensions: string; rooms: number; bedrooms: number; purpose: string[]; featured: boolean;
  createdAt: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; images: ProductImage[];
  parameters: Parameter[]; features: Record<string, string[]>;
  variants: { name: string; description: string; price: number }[];
};
