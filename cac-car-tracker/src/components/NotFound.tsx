import { Logo } from "./Logo";
import { t } from "@/lib/i18n";

export function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-6 p-6 text-center">
      <Logo size="lg" />
      <p className="max-w-sm text-lg text-muted" dir="rtl">
        {t("ar").notFound}
      </p>
      <p className="max-w-sm text-sm text-muted" dir="ltr">
        {t("en").notFound}
      </p>
    </main>
  );
}
