import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getAdminLang } from "@/lib/lang";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function LoginPage() {
  if (await isAuthed()) redirect("/admin");
  const lang = await getAdminLang();
  return <LoginForm lang={lang} />;
}
