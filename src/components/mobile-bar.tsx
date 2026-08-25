"use client";
import { Phone, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { salesContacts } from "@/lib/contact";
export function MobileBar() { const pathname=usePathname();if(pathname.startsWith("/admin"))return null;return <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 border-t bg-white p-2 shadow-2xl md:hidden"><a href={salesContacts[0].phoneHref} className="flex h-12 items-center justify-center gap-2 text-sm font-bold"><Phone size={18}/>Zadzwoń</a><Link href="/wycena" className="flex h-12 items-center justify-center gap-2 bg-[#171916] text-sm font-bold text-white"><FileText size={18}/>Wycena</Link></div>; }
