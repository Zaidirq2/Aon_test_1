import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getAdminLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { STAGES, stageIndex, stageLabel } from "@/lib/stages";
import { formatDateTime } from "@/lib/format";

export default async function AdminHome() {
  await requireAuth();
  const lang = await getAdminLang();
  const d = t(lang);
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } });
  const active = jobs.filter((j) => !j.deliveredAt);
  const delivered = jobs.filter((j) => j.deliveredAt).slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">
          {d.activeJobs} <span className="text-muted">({active.length})</span>
        </h1>
        <Link
          href="/admin/jobs/new"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 font-bold text-accent-ink hover:bg-accent-strong"
        >
          <span className="text-lg leading-none">+</span> {d.newJob}
        </Link>
      </div>

      {active.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-card-border p-8 text-center text-muted">{d.noJobs}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {active.map((job) => {
            const idx = stageIndex(job.currentStage);
            const ready = job.currentStage === "ready";
            return (
              <li key={job.id}>
                <Link
                  href={`/admin/jobs/${job.id}`}
                  className="block rounded-2xl border border-card-border bg-card p-4 transition hover:border-accent/60 active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-lg leading-tight">
                        {job.carMake} {job.carModel}
                      </div>
                      <div className="text-sm text-muted">
                        {job.customerName} · <span dir="auto">{job.plate}</span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${ready ? "bg-success/15 text-success" : "bg-accent/15 text-accent"}`}
                    >
                      {stageLabel(job.currentStage, lang)}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-muted truncate">{job.serviceName}</div>
                  <div className="mt-3 flex gap-1">
                    {STAGES.map((s, i) => (
                      <span
                        key={s.key}
                        className={`h-1.5 flex-1 rounded-full ${i < idx ? "bg-success/70" : i === idx ? (ready ? "bg-success" : "bg-accent") : "bg-fg/10"}`}
                      />
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted">
                    {d.estimatedReadyAt}: {job.estimatedReadyAt ? formatDateTime(job.estimatedReadyAt, lang) : d.tbd}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {delivered.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-muted">
            {d.deliveredJobs} <span>({delivered.length})</span>
          </h2>
          <ul className="mt-2 flex flex-col divide-y divide-card-border rounded-2xl border border-card-border bg-card">
            {delivered.map((job) => (
              <li key={job.id}>
                <Link href={`/admin/jobs/${job.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-bg/40">
                  <div>
                    <div className="font-semibold">
                      {job.carMake} {job.carModel}
                    </div>
                    <div className="text-xs text-muted">{job.customerName}</div>
                  </div>
                  <div className="text-xs text-success">✓ {formatDateTime(job.deliveredAt, lang)}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
