"use client";

import {
  Box,
  ChevronDown,
  CircleHelp,
  FileText,
  Images,
  LayoutDashboard,
  MessageSquareText,
  Plus,
  Settings,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";

const nav = [
  [LayoutDashboard, "Dashboard", "/admin"],
  [Box, "Produkty", "/admin/produkty"],
  [Tags, "Kategorie", "/admin/kategorie"],
  [Images, "Realizacje", "/admin/realizacje"],
  [MessageSquareText, "Zapytania", "/admin/zapytania"],
  [CircleHelp, "FAQ", "/admin/faq"],
  [FileText, "Treści", "/admin/tresci"],
  [Settings, "Ustawienia", "/admin/ustawienia"],
] as const;

function AdminNav({ pathname }: { pathname: string }) {
  return (
    <nav>
      {nav.map(([Icon, name, href]) => {
        const active =
          href === "/admin"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            href={href}
            key={href}
            className={`flex items-center gap-3 px-3 py-3 text-sm ${active ? "bg-white text-black" : "text-white/65 hover:text-white"}`}
          >
            <Icon size={17} />
            {name}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f3f3ef] px-4 py-8">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3ef]">
      <div className="container py-4 lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-6 lg:py-6">
        <aside className="hidden h-fit bg-[#171916] p-4 text-white lg:sticky lg:top-6 lg:block">
          <p className="px-3 py-4 text-xs font-bold uppercase tracking-[.18em] text-white/45">
            Panel administratora
          </p>
          <AdminNav pathname={pathname} />
          <Link href="/admin/produkty/nowy" className="btn btn-light mt-5 w-full !px-3">
            <Plus size={16} /> Dodaj model
          </Link>
          <LogoutButton />
        </aside>

        <div className="mb-5 bg-[#171916] p-3 text-white lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/45">
                Panel administratora
              </p>
              <p className="mt-1 text-sm font-bold">
                {nav.find(([, , href]) =>
                  href === "/admin"
                    ? pathname === href
                    : pathname === href || pathname.startsWith(`${href}/`),
                )?.[1] || "Panel"}
              </p>
            </div>
            <Link
              href="/admin/produkty/nowy"
              className="flex min-h-11 items-center gap-2 bg-white px-3 text-xs font-bold text-black"
            >
              <Plus size={15} /> Dodaj
            </Link>
          </div>
          <details className="group mt-3 border-t border-white/15 pt-2">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-2 text-sm text-white/70">
              Menu panelu
              <ChevronDown size={17} className="transition group-open:rotate-180" />
            </summary>
            <div className="pt-2">
              <AdminNav pathname={pathname} />
              <LogoutButton />
            </div>
          </details>
        </div>

        <div className="min-w-0 pb-8">{children}</div>
      </div>
    </div>
  );
}
