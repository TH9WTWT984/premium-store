const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const permissions = [
  ['products.read', 'View products and categories'],
  ['products.write', 'Create and edit products, categories and inventory'],
  ['orders.read', 'View orders'],
  ['orders.write', 'Manage order status and operations'],
  ['customers.read', 'View customers'],
  ['customers.write', 'Manage customer accounts'],
  ['inquiries.read', 'View wholesale and custom inquiries'],
  ['inquiries.write', 'Manage inquiry status and notes'],
  ['content.read', 'View content'],
  ['content.write', 'Manage blog, pages and homepage content'],
  ['settings.write', 'Manage store settings'],
  ['admins.manage', 'Create, update and deactivate admin users'],
  ['roles.manage', 'Create/update roles and permissions'],
  ['activity.read', 'View activity logs'],
];

const full = permissions.map(([key]) => key);

async function main() {
  const permissionRows = {};
  for (const [key, description] of permissions) {
    permissionRows[key] = await prisma.permission.upsert({
      where: { key },
      update: { description },
      create: { key, description },
    });
  }

  const templates = [
    { name: 'SUPER ADMIN', description: 'Full access including admin and role management', keys: full },
    { name: 'ADMIN', description: 'Full store operations except admin role management', keys: full.filter((key) => !['admins.manage', 'roles.manage'].includes(key)) },
    { name: 'ORDER MANAGER', description: 'Orders, inventory, inquiries and customer viewing', keys: ['orders.read', 'orders.write', 'products.read', 'products.write', 'inquiries.read', 'inquiries.write', 'customers.read'] },
    { name: 'CONTENT MANAGER', description: 'Blog, pages and homepage content', keys: ['content.read', 'content.write', 'products.read'] },
    { name: 'SUPPORT', description: 'Inquiries and customer viewing', keys: ['inquiries.read', 'inquiries.write', 'customers.read'] },
    { name: 'EDITOR', description: 'Products, categories and content editing', keys: ['products.read', 'products.write', 'content.read', 'content.write'] },
  ];

  for (const template of templates) {
    const role = await prisma.role.upsert({
      where: { name: template.name },
      update: { description: template.description },
      create: { name: template.name, description: template.description },
    });
    await prisma.role.update({
      where: { id: role.id },
      data: {
        permissions: { set: template.keys.map((key) => ({ id: permissionRows[key].id })) },
      },
    });
  }

  const legacyAdministrator = await prisma.role.findUnique({ where: { name: 'Administrator' } });
  const superAdmin = await prisma.role.findUnique({ where: { name: 'SUPER ADMIN' } });
  if (legacyAdministrator && superAdmin) {
    const legacyAdmins = await prisma.adminUser.findMany({ where: { roleId: legacyAdministrator.id }, select: { id: true } });
    if (legacyAdmins.length) {
      await prisma.adminUser.updateMany({ where: { id: { in: legacyAdmins.map((a) => a.id) } }, data: { roleId: superAdmin.id } });
    }
  }

  console.log('RBAC setup complete. Existing Administrator accounts were moved to SUPER ADMIN.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
