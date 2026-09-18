import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/auth';

async function getActor(key: string) {
  const admin = await getCurrentAdmin();
  if (!admin || !admin.role.permissions.some((permission) => permission.key === key)) return null;
  return admin;
}

const patchSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  roleId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const actor = await getActor('admins.manage');
  if (!actor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await context.params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid update' }, { status: 400 });

  if (id === actor.id && parsed.data.isActive === false) return NextResponse.json({ error: 'You cannot deactivate your own admin account.' }, { status: 400 });

  const existing = await prisma.adminUser.findUnique({ where: { id }, include: { role: true } });
  if (!existing) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

  if (parsed.data.roleId) {
    const role = await prisma.role.findUnique({ where: { id: parsed.data.roleId } });
    if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 400 });
  }

  const updated = await prisma.adminUser.update({
    where: { id },
    data: parsed.data,
    select: { id: true, email: true, name: true, isActive: true, lastLoginAt: true, createdAt: true, role: { select: { id: true, name: true } } },
  });

  await prisma.activityLog.create({ data: { adminUserId: actor.id, action: 'ADMIN_UPDATED', entity: 'AdminUser', entityId: id, metadata: parsed.data } });
  return NextResponse.json({ admin: updated });
}
