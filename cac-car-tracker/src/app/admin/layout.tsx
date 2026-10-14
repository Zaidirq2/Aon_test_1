import Link from "next/link";
import { Logo } from "@/components/Logo";
import { isAuthed } from "@/lib/auth";
import { getAdminLang } from "@/lib/lang";
import { dir, t } from "@/lib/i18n";
import { logout } from "./actions";
import { LangToggle } from "@/components/admin/LangToggle";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const lang = await getAdminLang();
  const authed = await isAuthed();
  const d = t(lang);
  return (
    <div dir={dir(lang)} className="flex-1 flex flex-col">
      <header className="sticky top-0 z-10 border-b border-card-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden text-sm text-muted sm:inline">· {d.adminTitle}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LangToggle lang={lang} />
            {authed && (
              <form action={logout}>
                <button className="min-h-10 rounded-full border border-card-border bg-card px-4 text-sm font-semibold hover:border-danger/60">
                  {d.logout}
                </button>
              </form>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">{children}</main>
    </div>
  );
}
