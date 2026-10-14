/**
 * Workshop stages, in order. Change this list to reconfigure the whole app:
 * the customer timeline, the admin stage buttons and the seed all read from it.
 */
export const STAGES = [
  { key: "received", ar: "استلام السيارة", en: "Received" },
  { key: "inspection", ar: "الفحص", en: "Inspection" },
  { key: "washing", ar: "الغسيل", en: "Washing" },
  { key: "polishing", ar: "التلميع / المعالجة", en: "Polishing / treatment" },
  { key: "protection", ar: "الحماية (كوتنج / PPF)", en: "Protection: coating / PPF" },
  { key: "final_check", ar: "الفحص النهائي", en: "Final check" },
  { key: "ready", ar: "جاهزة للتسليم", en: "Ready for pickup" },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];
export type Lang = "ar" | "en";

export const DELIVERED_STAGE = {
  key: "delivered",
  ar: "تم التسليم",
  en: "Delivered",
} as const;

export function stageIndex(key: string): number {
  return STAGES.findIndex((s) => s.key === key);
}

export function stageLabel(key: string, lang: Lang): string {
  if (key === DELIVERED_STAGE.key) return DELIVERED_STAGE[lang];
  const s = STAGES.find((x) => x.key === key);
  return s ? s[lang] : key;
}

export function isStageKey(value: unknown): value is StageKey {
  return typeof value === "string" && STAGES.some((s) => s.key === value);
}
