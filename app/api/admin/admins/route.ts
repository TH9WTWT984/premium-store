import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

async function requirePermission(key: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return null;
  if (!admin.role.permissions.some((permission) => permission.key === key)) return null;
  return admin;
}

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(180),
  password: z.string().min(8).max(200),
  roleId: z.string().min(1),
});

export async function GET() {
  const admin = await requirePermission('admins.manage');
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admins = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, isActive: true, lastLoginAt: true, createdAt: true, role: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ admins });
}

export async function POST(request: Request) {
  const actor = await requirePermission('admins.manage');
  if (!actor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid admin details', details: parsed.error.flatten() }, { status: 400 });

  const { name, email, password, roleId } = parsed.data;
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 400 });

  try {
    const created = await prisma.adminUser.create({
      data: { name, email: email.toLowerCase(), passwordHash: await hashPassword(password), roleId },
      select: { id: true, email: true, name: true, isActive: true, createdAt: true, role: { select: { id: true, name: true } } },
    });
    await prisma.activityLog.create({ data: { adminUserId: actor.id, action: 'ADMIN_CREATED', entity: 'AdminUser', entityId: created.id, metadata: { email: created.email, role: role.name } } });
    return NextResponse.json({ admin: created }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') return NextResponse.json({ error: 'An admin with this email already exists.' }, { status: 409 });
    console.error(error);
    return NextResponse.json({ error: 'Could not create admin' }, { status: 500 });
  }
}
