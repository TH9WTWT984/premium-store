'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './roles-manager.module.css';

type Permission = {
  id: string;
  key: string;
  description: string | null;
};

type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
  _count: { admins: number };
};

const categoryOrder = ['orders', 'products', 'customers', 'inquiries', 'content', 'admins', 'settings', 'activity', 'other'];

function categoryFor(key: string) {
  const prefix = key.split('.')[0];
  return categoryOrder.includes(prefix) ? prefix : 'other';
}

function labelFor(key: string) {
  return key
    .split('.')
    .map((part) => part.replace(/[-_]/g, ' '))
    .join(' / ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function countLabel(count: number) {
  return `${count} ${count === 1 ? 'admin' : 'admins'}`;
}

export default function RolesManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    setError('');
    const res = await fetch('/api/admin/roles', { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Could not load roles');
    setRoles(data.roles || []);
    setPermissions(data.permissions || []);
  }

  useEffect(() => {
    load();
  }, []);

  function start(role: Role) {
    setError('');
    setEditing(role.id);
    setDraft(role.permissions.map((permission) => permission.key));
  }

  function cancel() {
    setEditing(null);
    setDraft([]);
  }

  function toggle(key: string) {
    setDraft((items) => (items.includes(key) ? items.filter((item) => item !== key) : [...items, key]));
  }

  async function save(role: Role) {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/roles/${role.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ permissionKeys: draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not update role');
        return;
      }
      setEditing(null);
      setDraft([]);
      await load();
    } finally {
      setSaving(false);
    }
  }

  const groupedPermissions = useMemo(() => {
    const grouped: Record<string, Permission[]> = {};
    for (const permission of permissions) {
      const category = categoryFor(permission.key);
      (grouped[category] ||= []).push(permission);
    }
    return categoryOrder.filter((category) => grouped[category]?.length).map((category) => ({
      category,
      items: grouped[category],
    }));
  }, [permissions]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>ACCESS CONTROL</div>
          <h1 className={styles.title}>Roles &amp; Permissions</h1>
          <p className={styles.subtitle}>Define what each back-office role can see and change.</p>
        </div>
        <div className={styles.headerBadge}>
          <span className={styles.headerBadgeDot} />
          Server-enforced access
        </div>
      </header>

      {error && <div className={styles.alert}>{error}</div>}

      <section className={styles.introGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>ROLES</span>
          <strong>{roles.length}</strong>
          <span>Configured access profiles</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>PERMISSIONS</span>
          <strong>{permissions.length}</strong>
          <span>Available server-side rules</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>ASSIGNED ADMINS</span>
          <strong>{roles.reduce((total, role) => total + role._count.admins, 0)}</strong>
          <span>Across all roles</span>
        </div>
      </section>

      <div className={styles.sectionHead}>
        <div>
          <h2>Role profiles</h2>
          <p>Start with the access level that matches the person’s job.</p>
        </div>
        <span className={styles.roleCount}>{roles.length} roles</span>
      </div>

      <section className={styles.roleGrid}>
        {roles.map((role) => {
          const isEditing = editing === role.id;
          return (
            <article className={`${styles.roleCard} ${isEditing ? styles.roleCardEditing : ''}`} key={role.id}>
              <div className={styles.roleTop}>
                <div>
                  <div className={styles.roleKicker}>ROLE</div>
                  <h3>{role.name}</h3>
                </div>
                <span className={styles.adminCount}>{countLabel(role._count.admins)}</span>
              </div>

              <p className={styles.roleDescription}>{role.description || 'No description provided.'}</p>

              {!isEditing ? (
                <>
                  <div className={styles.permissionHeader}>
                    <span>ACCESS</span>
                    <strong>{role.permissions.length} permissions</strong>
                  </div>
                  <div className={styles.chips}>
                    {role.permissions.length ? role.permissions.map((permission) => (
                      <span className={styles.chip} key={permission.key}>{labelFor(permission.key)}</span>
                    )) : <span className={styles.emptyState}>No permissions assigned.</span>}
                  </div>
                  <button className={styles.primaryButton} onClick={() => start(role)} type="button">
                    Edit permissions
                    <span aria-hidden="true">→</span>
                  </button>
                </>
              ) : (
                <div className={styles.editor}>
                  <div className={styles.editorHead}>
                    <div>
                      <strong>Configure access</strong>
                      <span>Select the permissions this role should have.</span>
                    </div>
                    <span className={styles.selectionCount}>{draft.length} selected</span>
                  </div>

                  <div className={styles.permissionGroups}>
                    {groupedPermissions.map((group) => (
                      <div className={styles.permissionGroup} key={group.category}>
                        <div className={styles.groupTitle}>{group.category}</div>
                        {group.items.map((permission) => {
                          const checked = draft.includes(permission.key);
                          return (
                            <label className={`${styles.permissionRow} ${checked ? styles.permissionRowChecked : ''}`} key={permission.key}>
                              <input checked={checked} onChange={() => toggle(permission.key)} type="checkbox" />
                              <span className={styles.checkVisual} aria-hidden="true">{checked ? '✓' : ''}</span>
                              <span className={styles.permissionCopy}>
                                <strong>{labelFor(permission.key)}</strong>
                                <small>{permission.description || permission.key}</small>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  <div className={styles.editorActions}>
                    <button className={styles.primaryButton} disabled={saving} onClick={() => save(role)} type="button">
                      {saving ? 'Saving…' : 'Save permissions'}
                    </button>
                    <button className={styles.secondaryButton} disabled={saving} onClick={cancel} type="button">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>

      <div className={styles.footerNote}>
        <strong>Security boundary:</strong> these permissions are enforced on the server. Hiding a sidebar item never grants access by itself.
      </div>
    </div>
  );
}
