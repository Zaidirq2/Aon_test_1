import { requireAuth } from "@/lib/auth";
import { getAdminLang } from "@/lib/lang";
import { NewJobForm } from "@/components/admin/NewJobForm";

export default async function NewJobPage() {
  await requireAuth();
  const lang = await getAdminLang();
  return <NewJobForm lang={lang} />;
}
