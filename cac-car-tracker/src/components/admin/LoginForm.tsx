"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/stages";
import { Logo } from "@/components/Logo";

export function LoginForm({ lang }: { lang: Lang }) {
  const [state, action, pending] = useActionState(login, undefined);
  const d = t(lang);
  return (
    <div className="mx-auto mt-10 max-w-sm">
      <div className="flex justify-center">
        <Logo size="lg" />
      </div>
      <form action={action} className="mt-8 rounded-3xl border border-card-border bg-card p-6 flex flex-col gap-4">
        <h1 className="text-xl font-bold">{d.login}</h1>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">{d.password}</span>
          <input
            name="password"
            type="password"
            autoFocus
            required
            className="min-h-12 rounded-xl border border-card-border bg-bg px-4 text-base outline-none focus:border-accent"
          />
        </label>
        {state?.error && <p className="text-sm text-danger">{d.wrongPassword}</p>}
        <button
          disabled={pending}
          className="min-h-12 rounded-xl bg-accent font-bold text-accent-ink hover:bg-accent-strong disabled:opacity-60"
        >
          {d.login}
        </button>
      </form>
    </div>
  );
}
