import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/auth';

async function requireRoleManager() {
  const admin = await getCurrentAdmin();
  if (!admin || !admin.role.permissions.some((permission) => permission.key === 'roles.manage')) return null;
  return admin;
}

const patchSchema = z.object({ name: z.string().trim().min(2).max(60).optional(), description: z.string().trim().max(200).optional(), permissionKeys: z.array(z.string().min(1)).optional() });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const actor = await requireRoleManager();
  if (!actor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await context.params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid role update' }, { status: 400 });
  const existing = await prisma.role.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Role not found' }, { status: 404 });

  if (parsed.data.permissionKeys && id === actor.roleId && !parsed.data.permissionKeys.includes('roles.manage')) {
    return NextResponse.json({ error: 'You cannot remove roles.manage from your own role.' }, { status: 400 });
  }

  let permissionConnect: { id: string }[] | undefined;
  if (parsed.data.permissionKeys) {
    const rows = await prisma.permission.findMany({ where: { key: { in: parsed.data.permissionKeys } }, select: { id: true } });
    if (rows.length !== parsed.data.permissionKeys.length) return NextResponse.json({ error: 'One or more permissions are invalid.' }, { status: 400 });
    permissionConnect = rows.map((row) => ({ id: row.id }));
  }

  const role = await prisma.role.update({ where: { id }, data: { ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}), ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}), ...(permissionConnect ? { permissions: { set: permissionConnect } } : {}) }, include: { permissions: true, _count: { select: { admins: true } } } });
  await prisma.activityLog.create({ data: { adminUserId: actor.id, action: 'ROLE_UPDATED', entity: 'Role', entityId: id, metadata: parsed.data } });
  return NextResponse.json({ role });
}
