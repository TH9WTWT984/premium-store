import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/auth';

async function requireRoleManager() {
  const admin = await getCurrentAdmin();
  if (!admin || !admin.role.permissions.some((permission) => permission.key === 'roles.manage')) return null;
  return admin;
}

const createSchema = z.object({ name: z.string().trim().min(2).max(60), description: z.string().trim().max(200).optional(), permissionKeys: z.array(z.string().min(1)).default([]) });

export async function GET() {
  const actor = await requireRoleManager();
  if (!actor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({ orderBy: { name: 'asc' }, include: { permissions: { orderBy: { key: 'asc' }, select: { id: true, key: true } }, _count: { select: { admins: true } } } }),
    prisma.permission.findMany({ orderBy: { key: 'asc' }, select: { id: true, key: true, description: true } }),
  ]);
  return NextResponse.json({ roles, permissions });
}

export async function POST(request: Request) {
  const actor = await requireRoleManager();
  if (!actor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid role details' }, { status: 400 });

  const permissionRows = parsed.data.permissionKeys.length ? await prisma.permission.findMany({ where: { key: { in: parsed.data.permissionKeys } }, select: { id: true, key: true } }) : [];
  if (permissionRows.length !== parsed.data.permissionKeys.length) return NextResponse.json({ error: 'One or more permissions are invalid.' }, { status: 400 });

  try {
    const role = await prisma.role.create({ data: { name: parsed.data.name, description: parsed.data.description, permissions: { connect: permissionRows.map((p) => ({ id: p.id })) } }, include: { permissions: true, _count: { select: { admins: true } } } });
    await prisma.activityLog.create({ data: { adminUserId: actor.id, action: 'ROLE_CREATED', entity: 'Role', entityId: role.id, metadata: { name: role.name, permissions: parsed.data.permissionKeys } } });
    return NextResponse.json({ role }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') return NextResponse.json({ error: 'A role with this name already exists.' }, { status: 409 });
    console.error(error);
    return NextResponse.json({ error: 'Could not create role' }, { status: 500 });
  }
}
