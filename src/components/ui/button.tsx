import Link from "next/link";
export function Button({ href, children, variant = "dark", className = "" }: { href?: string; children: React.ReactNode; variant?: "dark" | "light" | "outline"; className?: string }) {
  const cn = `btn btn-${variant} ${className}`;
  return href ? <Link href={href} className={cn}>{children}</Link> : <button className={cn}>{children}</button>;
}
