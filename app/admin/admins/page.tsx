import { requireAdmin } from '@/lib/admin';
import AdminsManager from './admins-manager';

export default async function AdminsPage() {
  const admin = await requireAdmin();
  if (!admin.role.permissions.some((permission) => permission.key === 'admins.manage')) {
    return <div className="admin-page"><div className="admin-page-head"><h1>Admins</h1><p>You do not have permission to manage admin users.</p></div></div>;
  }
  return <AdminsManager />;
}
