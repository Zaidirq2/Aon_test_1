import { cookies } from "next/headers";
import type { Lang } from "./stages";

/** Admin UI language, stored in a cookie. Arabic by default. */
export async function getAdminLang(): Promise<Lang> {
  const store = await cookies();
  return store.get("cac_lang")?.value === "en" ? "en" : "ar";
}
