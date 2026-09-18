'use client';
import { FormEvent, useEffect, useState } from 'react';

type Role = { id: string; name: string };
type Admin = { id: string; email: string; name: string; isActive: boolean; lastLoginAt: string | null; createdAt: string; role: Role };
type AdminPatch = { name?: string; roleId?: string; isActive?: boolean };

export default function AdminsManager() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', roleId: '' });

  async function load() {
    setError('');
    const [a, r] = await Promise.all([fetch('/api/admin/admins'), fetch('/api/admin/roles')]);
    const aj = await a.json();
    const rj = await r.json();
    if (!a.ok) return setError(aj.error || 'Could not load admins');
    setAdmins(aj.admins);
    setRoles(rj.roles || []);
    if (!form.roleId && rj.roles?.[0]) setForm((f) => ({ ...f, roleId: rj.roles[0].id }));
  }

  useEffect(() => { load(); }, []);

  async function create(e: FormEvent) {
    e.preventDefault(); setError('');
    const res = await fetch('/api/admin/admins', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Could not create admin');
    setForm({ name: '', email: '', password: '', roleId: roles[0]?.id || '' });
    load();
  }

  async function update(id: string, patch: AdminPatch) {
    setError('');
    const res = await fetch(`/api/admin/admins/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(patch) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Could not update admin');
    setAdmins((items) => items.map((item) => item.id === id ? data.admin : item));
  }

  return <div className="admin-page">
    <div className="admin-page-head"><div><div className="admin-eyebrow">ACCESS CONTROL</div><h1>Admins</h1><p>Manage who can access the back office and what role they use.</p></div></div>
    {error && <div className="admin-alert admin-alert-error">{error}</div>}
    <div className="admin-rbac-grid">
      <form className="admin-card admin-form-card" onSubmit={create}>
        <h2>Add admin</h2>
        <input className="admin-input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="admin-input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="admin-input" type="password" placeholder="Temporary password (8+ chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select className="admin-input" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} required><option value="">Select role</option>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
        <button className="admin-button" type="submit">Create admin</button>
      </form>
      <div className="admin-card"><div className="admin-card-head"><h2>Current admins</h2><span className="admin-muted">{admins.length} accounts</span></div>
        <div className="admin-rbac-table">{admins.map((admin) => <div className="admin-rbac-row" key={admin.id}>
          <div><strong>{admin.name}</strong><small>{admin.email}</small></div>
          <select className="admin-input admin-select-small" value={admin.role.id} onChange={(e) => update(admin.id, { roleId: e.target.value })}>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
          <span className={admin.isActive ? 'admin-status admin-status-live' : 'admin-status'}>{admin.isActive ? 'Active' : 'Disabled'}</span>
          <button className="admin-button admin-button-ghost" onClick={() => update(admin.id, { isActive: !admin.isActive })}>{admin.isActive ? 'Disable' : 'Enable'}</button>
        </div>)}</div>
      </div>
    </div>
  </div>;
}
