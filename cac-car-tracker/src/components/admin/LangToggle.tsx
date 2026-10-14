"use client";

import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/stages";
import { t } from "@/lib/i18n";

export function LangToggle({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const next = lang === "ar" ? "en" : "ar";
  return (
    <a
      href={`/admin/lang?set=${next}&back=${encodeURIComponent(pathname || "/admin")}`}
      className="min-h-10 inline-flex items-center rounded-full border border-card-border bg-card px-4 text-sm font-semibold hover:border-accent/60"
    >
      {t(lang).switchLang}
    </a>
  );
}
