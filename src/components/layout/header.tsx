"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useLocaleStore } from "@/store/useLocaleStore";
import { LocaleToggle } from "./locale-toggle";

export function Header() {
  const pathname = usePathname();
  const locale = useLocaleStore((state) => state.locale);
  const links = [
    { href: "/", label: t(locale, "navHome") },
    { href: "/builder", label: t(locale, "navBuilder") },
    { href: "/compare", label: t(locale, "navCompare") },
    { href: "/admin", label: t(locale, "navAdmin") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-surface-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-transparent p-0">
            <Image
              src="/assets/img/logo.png"
              alt="A.R.K.A.N.T.A. logo"
              width={48}
              height={48}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div>
            <p className="text-base font-semibold text-white">A.R.K.A.N.T.A.</p>
            <p className="text-xs text-zinc-400">{t(locale, "appTagline")}</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <LocaleToggle />
          <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm text-zinc-400 transition hover:text-white",
                  pathname === link.href && "bg-white/10 text-white",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
