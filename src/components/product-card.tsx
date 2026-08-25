import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Maximize2, BedDouble } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
export function ProductCard({ product }: { product: Product }) {
  const image = product.images.find(i => i.is_main) || product.images[0];
  return <article className="card-lift group border border-[#dedfd9] bg-white"><Link href={`/modele/${product.slug}`}><div className="relative aspect-[4/3] overflow-hidden bg-[#ecece7]"><Image src={image?.url || "/images/modern-olive.png"} alt={image?.alt || product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.035]"/><span className="absolute left-4 top-4 bg-white/90 px-3 py-2 text-[10px] font-bold uppercase tracking-widest backdrop-blur">{product.category}</span></div><div className="p-5"><div className="flex items-start justify-between"><div><h3 className="text-xl font-bold tracking-tight">{product.name}</h3><p className="mt-2 text-sm text-[#666b63]">{product.shortDescription}</p></div><ArrowUpRight className="shrink-0" size={20}/></div><div className="mt-6 flex gap-5 border-t border-[#e4e5df] pt-4 text-xs text-[#666b63]"><span className="flex items-center gap-2"><Maximize2 size={15}/>{product.area} m²</span><span className="flex items-center gap-2"><BedDouble size={15}/>{product.rooms} pom.</span></div><div className="mt-4 flex items-end justify-between"><span className="text-xs uppercase tracking-wider text-[#777]">Cena od</span><strong className="text-lg">{formatPrice(product.priceFrom)}</strong></div></div></Link></article>;
}
