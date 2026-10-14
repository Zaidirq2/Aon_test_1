"use client";

import { useActionState, useState } from "react";
import { updateStage } from "@/app/admin/actions";
import { t } from "@/lib/i18n";
import { STAGES, stageIndex, type Lang } from "@/lib/stages";

export function StageUpdateForm({
  jobId,
  currentStage,
  lang,
  delivered,
}: {
  jobId: string;
  currentStage: string;
  lang: Lang;
  delivered: boolean;
}) {
  const d = t(lang);
  const [state, action, pending] = useActionState(updateStage, undefined);
  const [selected, setSelected] = useState(currentStage);
  const [fileName, setFileName] = useState<string | null>(null);
  const currentIdx = stageIndex(currentStage);
  // The parent remounts this form (via `key`) after every saved update, which resets all fields.

  return (
    <form action={action} className="rounded-3xl border border-card-border bg-card p-5 flex flex-col gap-4">
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="stage" value={selected} />
      <div>
        <h2 className="text-base font-bold">{d.updateStage}</h2>
        <p className="text-xs text-muted">
          {d.tapStage} · {d.stageHint}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {STAGES.map((s, i) => {
          const isCurrent = s.key === currentStage && !delivered;
          const isSelected = s.key === selected;
          const done = !delivered && i < currentIdx;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setSelected(s.key)}
              aria-pressed={isSelected}
              className={`min-h-14 rounded-xl border px-3 text-sm font-semibold leading-tight transition active:scale-95 ${
                isSelected
                  ? "border-accent bg-accent text-accent-ink"
                  : isCurrent
                    ? "border-accent/70 bg-accent/10 text-accent"
                    : done
                      ? "border-card-border bg-bg text-success/80"
                      : "border-card-border bg-bg text-fg/90 hover:border-accent/50"
              }`}
            >
              <span className="me-1 text-xs opacity-70">{i + 1}.</span>
              {s[lang]}
            </button>
          );
        })}
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">{d.note}</span>
        <textarea
          name="note"
          rows={2}
          className="rounded-xl border border-card-border bg-bg px-4 py-3 text-base outline-none focus:border-accent"
        />
      </label>

      <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-card-border bg-bg px-4 text-sm hover:border-accent/60">
        <span className="text-muted">
          📷 {d.photo}
          {fileName && <span className="ms-2 text-fg">{fileName}</span>}
        </span>
        <input
          name="photo"
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </label>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        disabled={pending}
        className="min-h-12 rounded-xl bg-accent text-base font-bold text-accent-ink hover:bg-accent-strong disabled:opacity-60"
      >
        {pending ? "…" : d.save}
      </button>
    </form>
  );
}
