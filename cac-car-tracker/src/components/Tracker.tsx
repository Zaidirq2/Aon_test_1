"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { TrackerJob } from "@/lib/jobs";
import { STAGES, stageIndex, stageLabel, type Lang } from "@/lib/stages";
import { CAC, dir, t } from "@/lib/i18n";
import { formatDateTime, formatTime, toWhatsAppNumber } from "@/lib/format";
import { Logo } from "./Logo";

const REFRESH_MS = 30_000;
const LANG_KEY = "cac-lang";
const LANG_EVENT = "cac-lang-change";

// Language preference lives in localStorage; Arabic is the default (and the server-rendered value).
function subscribeLang(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(LANG_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(LANG_EVENT, cb);
  };
}
function readLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === "en" ? "en" : "ar";
  } catch {
    return "ar";
  }
}
function writeLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {}
  window.dispatchEvent(new Event(LANG_EVENT));
}

export function Tracker({ token, initialJob }: { token: string; initialJob: TrackerJob }) {
  const [job, setJob] = useState(initialJob);
  const lang = useSyncExternalStore(subscribeLang, readLang, () => "ar" as Lang);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const d = t(lang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir(lang);
  }, [lang]);

  // Live refresh.
  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(token)}`, { cache: "no-store" });
      if (res.ok) {
        setJob((await res.json()) as TrackerJob);
        setFetchedAt(new Date());
      }
    } catch {}
  }, [token]);
  useEffect(() => {
    const id = setInterval(refresh, REFRESH_MS);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const delivered = Boolean(job.deliveredAt);
  const currentIdx = stageIndex(job.currentStage);
  const isReady = !delivered && job.currentStage === "ready";
  const percent = delivered ? 100 : Math.round(((currentIdx + 1) / STAGES.length) * 100);

  const firstUpdateByStage = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of job.updates) if (!map.has(u.stage)) map.set(u.stage, u.createdAt);
    return map;
  }, [job.updates]);

  const photos = job.updates.filter((u) => u.photoUrl).reverse();
  const notes = [...job.updates].reverse();
  const phone = process.env.NEXT_PUBLIC_CAC_PHONE || "+9647700000000";

  return (
    <div dir={dir(lang)} className="flex-1 flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur bg-bg/80 border-b border-card-border">
        <div className="mx-auto max-w-xl px-4 py-3 flex items-center justify-between gap-3">
          <Logo size="sm" />
          <button
            type="button"
            onClick={() => writeLang(lang === "ar" ? "en" : "ar")}
            className="min-h-11 rounded-full border border-card-border bg-card px-4 text-sm font-semibold hover:border-accent/60 active:scale-95 transition"
            aria-label="Switch language"
          >
            {d.switchLang}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl px-4 pb-10 pt-5 flex flex-col gap-4">
        {/* Hero: car + current status */}
        <section className="rounded-3xl border border-card-border bg-gradient-to-b from-bg-elevated to-card p-5 shadow-[0_20px_60px_-30px_rgba(232,184,74,0.35)]">
          <div className="text-xs uppercase tracking-widest text-muted">{d.yourCar}</div>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight">
            {job.carMake} {job.carModel}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              dir="auto"
              className="rounded-md border border-fg/20 bg-fg/5 px-2.5 py-1 font-mono text-sm font-bold tracking-wider"
            >
              {job.plate}
            </span>
            <span className="text-sm text-muted">
              {d.service}: <span className="text-fg">{job.serviceName}</span>
            </span>
          </div>

          <div className="mt-5 rounded-2xl border border-card-border bg-bg/60 p-4">
            {delivered ? (
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-success/15 text-success text-2xl">✓</span>
                <div>
                  <div className="text-lg font-bold text-success">{d.delivered}</div>
                  <div className="mt-1 text-sm text-muted">{d.deliveredThanks}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center">
                  <span className={`block h-3 w-3 rounded-full ${isReady ? "bg-success" : "bg-accent pulse-ring"}`} />
                </span>
                <div className="flex-1">
                  <div className="text-xs text-muted">{d.currentStage}</div>
                  <div className={`text-xl font-bold ${isReady ? "text-success" : "text-accent-strong"}`}>
                    {stageLabel(job.currentStage, lang)}
                  </div>
                  {isReady && <div className="mt-1 text-sm text-success/90">{d.readyBanner}</div>}
                </div>
                <div className="text-end">
                  <div className="text-2xl font-extrabold tabular-nums">{percent}%</div>
                </div>
              </div>
            )}
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-fg/10" role="progressbar" aria-valuenow={percent}>
              <div
                className={`h-full rounded-full transition-all duration-700 ${delivered || isReady ? "bg-success" : "bg-gradient-to-l from-accent-strong to-accent"}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-bg/40 p-3">
              <dt className="text-xs text-muted">{delivered ? d.deliveredAt : d.estimatedReady}</dt>
              <dd className="mt-0.5 font-semibold">
                {delivered
                  ? formatDateTime(job.deliveredAt, lang)
                  : job.estimatedReadyAt
                    ? formatDateTime(job.estimatedReadyAt, lang)
                    : d.tbd}
              </dd>
            </div>
            <div className="rounded-xl bg-bg/40 p-3">
              <dt className="text-xs text-muted">{d.lastUpdate}</dt>
              <dd className="mt-0.5 font-semibold">{formatDateTime(job.lastUpdateAt, lang)}</dd>
            </div>
          </dl>
        </section>

        {/* Timeline */}
        <section className="rounded-3xl border border-card-border bg-card p-5">
          <h2 className="text-base font-bold">{d.progress}</h2>
          <ol className="mt-4 flex flex-col">
            {STAGES.map((s, i) => {
              const state = delivered || i < currentIdx ? "done" : i === currentIdx ? "current" : "pending";
              const at = firstUpdateByStage.get(s.key);
              const last = i === STAGES.length - 1;
              return (
                <li key={s.key} className="relative flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-sm font-bold transition ${
                        state === "done"
                          ? "border-success bg-success text-accent-ink"
                          : state === "current"
                            ? "border-accent bg-accent text-accent-ink pulse-ring"
                            : "border-card-border bg-bg text-muted"
                      }`}
                    >
                      {state === "done" ? "✓" : i + 1}
                    </span>
                    {!last && <span className={`w-0.5 flex-1 min-h-6 ${state === "done" ? "bg-success/60" : "bg-card-border"}`} />}
                  </div>
                  <div className={`pb-5 ${last ? "pb-0" : ""}`}>
                    <div className={`font-semibold leading-8 ${state === "pending" ? "text-muted" : ""}`}>{s[lang]}</div>
                    <div className="text-xs text-muted">
                      {state === "done" && at ? formatDateTime(at, lang) : state === "current" ? d.inProgress : state === "done" ? d.done : d.pending}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Photos */}
        <section className="rounded-3xl border border-card-border bg-card p-5">
          <h2 className="text-base font-bold">{d.photos}</h2>
          {photos.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-card-border p-6 text-center text-sm text-muted">{d.noPhotos}</p>
          ) : (
            <div className="mt-3 -mx-5 flex gap-3 overflow-x-auto px-5 pb-1 snap-x">
              {photos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setLightbox(p.photoUrl)}
                  className="relative h-44 w-60 shrink-0 snap-start overflow-hidden rounded-2xl border border-card-border bg-bg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.photoUrl!} alt={stageLabel(p.stage, lang)} className="h-full w-full object-cover" loading="lazy" />
                  <span className="absolute bottom-2 start-2 rounded-md bg-bg/80 px-2 py-0.5 text-xs backdrop-blur">
                    {stageLabel(p.stage, lang)} · {formatTime(p.createdAt, lang)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Update log */}
        {notes.some((n) => n.note) && (
          <section className="rounded-3xl border border-card-border bg-card p-5">
            <h2 className="text-base font-bold">{d.updates}</h2>
            <ul className="mt-3 flex flex-col divide-y divide-card-border">
              {notes
                .filter((n) => n.note)
                .map((n) => (
                  <li key={n.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3 text-xs text-muted">
                      <span className="font-semibold text-accent">{stageLabel(n.stage, lang)}</span>
                      <span>{formatDateTime(n.createdAt, lang)}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed" dir="auto">
                      {n.note}
                    </p>
                  </li>
                ))}
            </ul>
          </section>
        )}

        <p className="text-center text-xs text-muted">
          {d.refreshing}
          {fetchedAt && ` · ${formatTime(fetchedAt, lang)}`}
        </p>
      </main>

      <footer className="mt-auto border-t border-card-border bg-bg-elevated">
        <div className="mx-auto max-w-xl px-4 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${phone}`}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-card-border bg-card font-bold active:scale-95 transition"
            >
              <span aria-hidden>📞</span> {d.callUs}
            </a>
            <a
              href={`https://wa.me/${toWhatsAppNumber(phone)}`}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-whatsapp font-bold text-accent-ink active:scale-95 transition"
            >
              <span aria-hidden>💬</span> {d.whatsapp}
            </a>
          </div>
          <div className="text-sm text-muted">
            <div>
              <span className="text-fg font-semibold">{d.hours}:</span> {CAC.hours[lang]}
            </div>
            <div>
              {CAC.fullName} · {CAC.location[lang]} ·{" "}
              <a href={CAC.website} className="underline decoration-accent/50 underline-offset-4" target="_blank" rel="noreferrer">
                cac-iq.com
              </a>
            </div>
          </div>
        </div>
      </footer>

      {lightbox && (
        <button
          type="button"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
          aria-label="Close photo"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-xl object-contain" />
        </button>
      )}
    </div>
  );
}
