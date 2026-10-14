"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createJob } from "@/app/admin/actions";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/stages";

const input =
  "min-h-12 w-full rounded-xl border border-card-border bg-bg px-4 text-base outline-none focus:border-accent";

function Field({ name, label, type = "text", dir, placeholder }: { name: string; label: string; type?: string; dir?: "ltr" | "rtl"; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted">{label}</span>
      <input name={name} type={type} dir={dir} placeholder={placeholder} required={type !== "datetime-local"} className={input} />
    </label>
  );
}

export function NewJobForm({ lang }: { lang: Lang }) {
  const [state, action, pending] = useActionState(createJob, undefined);
  const d = t(lang);

  return (
    <form action={action} className="mx-auto max-w-lg rounded-3xl border border-card-border bg-card p-5 flex flex-col gap-4">
      <h1 className="text-xl font-bold">{d.newJob}</h1>
      <Field name="customerName" label={d.customerName} />
      <Field name="customerPhone" label={d.customerPhone} type="tel" dir="ltr" placeholder="07xx xxx xxxx" />
      <div className="grid grid-cols-2 gap-3">
        <Field name="carMake" label={d.carMake} placeholder="Toyota" />
        <Field name="carModel" label={d.carModel} placeholder="Land Cruiser 2023" />
      </div>
      <Field name="plate" label={d.plateNo} />
      <Field name="serviceName" label={d.serviceName} />
      <Field name="estimatedReadyAt" label={d.estimatedReadyAt} type="datetime-local" dir="ltr" />
      {state?.error && <p className="text-sm text-danger">{state.error === "required" ? d.required : state.error}</p>}
      <div className="mt-2 flex gap-3">
        <button disabled={pending} className="min-h-12 flex-1 rounded-xl bg-accent font-bold text-accent-ink hover:bg-accent-strong disabled:opacity-60">
          {d.create}
        </button>
        <Link href="/admin" className="inline-flex min-h-12 items-center rounded-xl border border-card-border px-5 font-semibold">
          {d.cancel}
        </Link>
      </div>
    </form>
  );
}
