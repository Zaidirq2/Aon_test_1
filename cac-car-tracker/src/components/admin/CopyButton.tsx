"use client";

import { useState } from "react";

export function CopyButton({ text, label, copiedLabel }: { text: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          window.prompt("Copy link", text);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="min-h-12 rounded-xl border border-card-border bg-bg px-3 text-sm font-semibold hover:border-accent/60"
    >
      {copied ? `✓ ${copiedLabel}` : label}
    </button>
  );
}
