import AdminShell from "../components/admin-shell";
import HomePageManager from "./homepage-manager";
import { getCurrentAdmin } from "@/lib/auth";

export default async function AdminHomepage() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;
  return <AdminShell adminName={admin.name} adminRole={admin.role.name}><HomePageManager /></AdminShell>;
}
