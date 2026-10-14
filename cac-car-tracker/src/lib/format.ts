import type { Lang } from "./stages";

export const TIME_ZONE = "Asia/Baghdad";

function locale(lang: Lang): string {
  // Latin digits in both languages keep plates, phones and times easy to read.
  return lang === "ar" ? "ar-IQ-u-nu-latn" : "en-GB";
}

export function formatDateTime(date: Date | string | null | undefined, lang: Lang): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale(lang), {
    timeZone: TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function formatTime(date: Date | string | null | undefined, lang: Lang): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale(lang), {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

/** Normalise an Iraqi phone number to international digits for wa.me (07xx... -> 9647xx...). */
export function toWhatsAppNumber(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = "964" + digits.slice(1);
  return digits;
}

export function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function trackingUrl(token: string): string {
  return `${baseUrl()}/t/${token}`;
}

export function whatsAppShareUrl(phone: string, customerName: string, token: string): string {
  const link = trackingUrl(token);
  const message =
    `مرحباً ${customerName}، أهلاً بك في CAC - Complete Auto Care.\n` +
    `يمكنك متابعة حالة سيارتك مباشرة من خلال هذا الرابط:\n${link}\n\n` +
    `سنقوم بتحديث الحالة في كل مرحلة. شكراً لثقتك بنا 🚗✨`;
  return `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`;
}

/** Format a Date for an <input type="datetime-local"> in Baghdad time. */
export function toLocalInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Parse a datetime-local value as Baghdad time (UTC+3, no DST). */
export function fromLocalInputValue(value: string): Date | null {
  if (!value) return null;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  return new Date(Date.UTC(+y, +mo - 1, +d, +h - 3, +mi));
}
