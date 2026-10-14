import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getAdminLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { stageLabel } from "@/lib/stages";
import { formatDateTime, toLocalInputValue, trackingUrl, whatsAppShareUrl } from "@/lib/format";
import { markDelivered, updateEstimate } from "@/app/admin/actions";
import { StageUpdateForm } from "@/components/admin/StageUpdateForm";
import { CopyButton } from "@/components/admin/CopyButton";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;
  const lang = await getAdminLang();
  const d = t(lang);
  const job = await prisma.job.findUnique({ where: { id }, include: { updates: { orderBy: { createdAt: "desc" } } } });
  if (!job) notFound();

  const link = trackingUrl(job.token);
  const delivered = Boolean(job.deliveredAt);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin" className="text-sm text-muted hover:text-fg">
        ← {d.back}
      </Link>

      {/* Summary */}
      <section className="rounded-3xl border border-card-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight">
              {job.carMake} {job.carModel}
            </h1>
            <div className="mt-1 text-muted">
              {job.customerName} ·{" "}
              <a dir="ltr" href={`tel:${job.customerPhone}`} className="underline underline-offset-4">
                {job.customerPhone}
              </a>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span dir="auto" className="rounded-md border border-fg/20 bg-fg/5 px-2 py-0.5 font-mono font-bold">
                {job.plate}
              </span>
              <span className="text-muted">{job.serviceName}</span>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${delivered ? "bg-success/15 text-success" : "bg-accent/15 text-accent"}`}>
            {delivered ? d.deliveredJobs : stageLabel(job.currentStage, lang)}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a
            href={whatsAppShareUrl(job.customerPhone, job.customerName, job.token)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-whatsapp font-bold text-accent-ink active:scale-95 transition"
          >
            <span aria-hidden>💬</span> {d.sendWhatsApp}
          </a>
          <div className="grid grid-cols-2 gap-3">
            <CopyButton text={link} label={d.copyLink} copiedLabel={d.copied} />
            <a
              href={`/t/${job.token}`}
              target="_blank"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-card-border bg-bg px-3 text-sm font-semibold hover:border-accent/60"
            >
              {d.openCustomerView}
            </a>
          </div>
        </div>
        <p dir="ltr" className="mt-2 truncate text-xs text-muted text-start">
          {link}
        </p>

        <form action={updateEstimate} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="jobId" value={job.id} />
          <label className="flex flex-1 flex-col gap-1 text-sm min-w-48">
            <span className="text-muted">{d.estimatedReadyAt}</span>
            <input
              name="estimatedReadyAt"
              type="datetime-local"
              dir="ltr"
              defaultValue={toLocalInputValue(job.estimatedReadyAt)}
              className="min-h-11 rounded-xl border border-card-border bg-bg px-3 text-base outline-none focus:border-accent"
            />
          </label>
          <button className="min-h-11 rounded-xl border border-card-border px-4 text-sm font-semibold hover:border-accent/60">{d.saveEstimate}</button>
        </form>
        <div className="mt-3 text-xs text-muted">
          {d.created}: {formatDateTime(job.createdAt, lang)}
          {job.deliveredAt && (
            <>
              {" · "}
              {d.deliveredAt}: <span className="text-success">{formatDateTime(job.deliveredAt, lang)}</span>
            </>
          )}
        </div>
      </section>

      {/* Stage update */}
      <StageUpdateForm key={`${job.currentStage}-${job.updates.length}-${delivered}`} jobId={job.id} currentStage={job.currentStage} lang={lang} delivered={delivered} />

      {!delivered && (
        <form action={markDelivered} className="rounded-3xl border border-card-border bg-card p-5">
          <input type="hidden" name="jobId" value={job.id} />
          <ConfirmSubmit
            confirm={d.markDeliveredConfirm}
            className="min-h-12 w-full rounded-xl bg-success font-bold text-accent-ink active:scale-95 transition"
          >
            ✓ {d.markDelivered}
          </ConfirmSubmit>
        </form>
      )}

      {/* History */}
      <section className="rounded-3xl border border-card-border bg-card p-5">
        <h2 className="text-base font-bold">{d.history}</h2>
        <ul className="mt-3 flex flex-col divide-y divide-card-border">
          {job.updates.map((u) => (
            <li key={u.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              {u.photoPath && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/photos/${encodeURIComponent(u.photoPath)}`}
                  alt=""
                  className="h-16 w-20 shrink-0 rounded-lg object-cover border border-card-border"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 text-xs text-muted">
                  <span className="font-semibold text-accent">{stageLabel(u.stage, lang)}</span>
                  <span>{formatDateTime(u.createdAt, lang)}</span>
                </div>
                {u.note && (
                  <p dir="auto" className="mt-1 text-sm">
                    {u.note}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
