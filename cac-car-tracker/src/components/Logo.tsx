import { CAC } from "@/lib/i18n";

/** Placeholder for the real CAC logo: swap the inner box for an <Image> once the asset is available. */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "h-14 w-14 text-xl" : size === "sm" ? "h-9 w-9 text-sm" : "h-11 w-11 text-base";
  const title = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  return (
    <div className="flex items-center gap-3">
      <div
        className={`${box} shrink-0 rounded-xl border border-accent/50 bg-gradient-to-br from-accent/25 to-transparent grid place-items-center font-extrabold tracking-widest text-accent`}
        aria-hidden
        title="Logo placeholder"
      >
        {CAC.name}
      </div>
      <div className="leading-tight">
        <div className={`${title} font-bold`}>{CAC.name}</div>
        <div className="text-xs text-muted">{CAC.fullName}</div>
      </div>
    </div>
  );
}
