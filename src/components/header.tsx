"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./logo";
const links = [["Modele", "/modele"], ["Realizacje", "/realizacje"], ["Jak budujemy", "/jak-budujemy"], ["O nas", "/o-nas"], ["FAQ", "/#faq"], ["Kontakt", "/kontakt"]];
export function Header() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur"><div className="container flex h-[76px] items-center justify-between"><Logo /><nav className="hidden items-center gap-7 lg:flex">{links.map(([n,h]) => <Link className="text-[12px] font-semibold hover:text-[#68715a]" key={h} href={h}>{n}</Link>)}<Link href="/wycena" className="btn btn-dark !min-h-11">Wycena</Link></nav><button className="grid h-11 w-11 place-items-center lg:hidden" onClick={() => setOpen(!open)} aria-label="Otwórz menu">{open ? <X /> : <Menu />}</button></div>{open && <nav className="border-t bg-white px-4 pb-5 lg:hidden">{links.map(([n,h]) => <Link onClick={() => setOpen(false)} className="block border-b py-4 text-sm font-semibold" key={h} href={h}>{n}</Link>)}<Link onClick={() => setOpen(false)} href="/wycena" className="btn btn-dark mt-5 w-full">Wycena</Link></nav>}</header>;
}
