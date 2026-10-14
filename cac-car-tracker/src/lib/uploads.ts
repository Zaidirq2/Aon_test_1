import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

export const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic"]);
const MAX_BYTES = 15 * 1024 * 1024;

/** Saves an uploaded photo to data/uploads and returns the stored file name, or null if nothing valid was sent. */
export async function savePhoto(file: FormDataEntryValue | null): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_BYTES) throw new Error("Photo is too large (max 15 MB)");
  let ext = path.extname(file.name).toLowerCase();
  if (!ext && file.type.startsWith("image/")) ext = "." + file.type.split("/")[1].replace("jpeg", "jpg");
  if (!ALLOWED.has(ext)) throw new Error("Unsupported photo type");
  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return name;
}
