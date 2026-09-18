import AdminShell from "@/app/admin/components/admin-shell";
import PagesManager from "./pages-manager";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PagesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin");

  return (
    <AdminShell adminName={admin.name} adminRole={admin.role.name}>
      <PagesManager />
    </AdminShell>
  );
}
