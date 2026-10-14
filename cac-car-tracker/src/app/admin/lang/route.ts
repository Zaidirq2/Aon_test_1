import { NextResponse, type NextRequest } from "next/server";

/** GET /admin/lang?set=en&back=/admin -> sets the admin language cookie and redirects back. */
export function GET(req: NextRequest) {
  const set = req.nextUrl.searchParams.get("set") === "en" ? "en" : "ar";
  const back = req.nextUrl.searchParams.get("back") || "/admin";
  const safeBack = back.startsWith("/") && !back.startsWith("//") ? back : "/admin";
  const res = NextResponse.redirect(new URL(safeBack, req.url));
  res.cookies.set("cac_lang", set, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}
