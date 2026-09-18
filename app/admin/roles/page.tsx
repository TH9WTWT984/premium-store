import { requireAdmin } from '@/lib/admin';
import RolesManager from './roles-manager';

export default async function RolesPage() {
  const admin = await requireAdmin();
  if (!admin.role.permissions.some((permission) => permission.key === 'roles.manage')) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{ fontSize: 11, letterSpacing: '.16em', fontWeight: 700, color: '#8b8378', marginBottom: 8 }}>ACCESS CONTROL</div>
          <h1 style={{ fontFamily: 'Georgia, Times New Roman, serif', fontWeight: 500, fontSize: 42, margin: 0 }}>Roles &amp; Permissions</h1>
          <p style={{ color: '#766f67', fontSize: 14 }}>You do not have permission to manage roles.</p>
        </div>
      </div>
    );
  }
  return <RolesManager />;
}
