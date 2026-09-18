import { PrismaClient, ProductStatus, UserRole } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Apparel", slug: "apparel", description: "Quiet essentials made for everyday wear." },
    { name: "Home", slug: "home", description: "Objects that bring warmth and restraint into a space." },
    { name: "Objects", slug: "objects", description: "Useful pieces with a considered point of view." },
  ];

  for (const category of categories) {
    await prisma.category.upsert({ where: { slug: category.slug }, update: category, create: category });
  }

  const apparel = await prisma.category.findUniqueOrThrow({ where: { slug: "apparel" } });
  const home = await prisma.category.findUniqueOrThrow({ where: { slug: "home" } });
  const objects = await prisma.category.findUniqueOrThrow({ where: { slug: "objects" } });

  const products = [
    {
      name: "Linen Overshirt", slug: "linen-overshirt", categoryId: apparel.id,
      description: "A relaxed overshirt cut from breathable linen with an easy, structured drape.",
      shortDescription: "Relaxed linen overshirt.", sku: "AT-OVS-001", price: 12499, featured: true,
      image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85",
      variant: { name: "Natural / M", sku: "AT-OVS-001-M", stock: 24 },
    },
    {
      name: "Stoneware Vessel", slug: "stoneware-vessel", categoryId: home.id,
      description: "Hand-finished stoneware with a softly irregular silhouette and a tactile matte surface.",
      shortDescription: "Hand-finished stoneware.", sku: "AT-VES-002", price: 5999, featured: true,
      image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=85",
      variant: { name: "One Size", sku: "AT-VES-002-OS", stock: 18 },
    },
    {
      name: "Leather Carryall", slug: "leather-carryall", categoryId: objects.id,
      description: "A full-grain leather carryall designed to age with use and travel.",
      shortDescription: "Full-grain leather carryall.", sku: "AT-CAR-003", price: 17999, featured: true,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85",
      variant: { name: "Black / One Size", sku: "AT-CAR-003-BLK", stock: 11 },
    },
    {
      name: "Cedar & Fig Candle", slug: "cedar-fig-candle", categoryId: home.id,
      description: "A restrained candle with cedar, fig leaf and dry woods.",
      shortDescription: "Cedar, fig leaf and dry woods.", sku: "AT-CAN-004", price: 3999, featured: false,
      image: "https://images.unsplash.com/photo-1602874801006-e26e5c0c0e0a?auto=format&fit=crop&w=1200&q=85",
      variant: { name: "220g", sku: "AT-CAN-004-220", stock: 31 },
    },
  ];

  for (const product of products) {
    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        categoryId: product.categoryId, name: product.name, description: product.description,
        shortDescription: product.shortDescription, sku: product.sku, price: product.price,
        featured: product.featured, status: ProductStatus.ACTIVE,
      },
      create: {
        categoryId: product.categoryId, name: product.name, slug: product.slug,
        description: product.description, shortDescription: product.shortDescription,
        sku: product.sku, price: product.price, featured: product.featured, status: ProductStatus.ACTIVE,
      },
    });
    await prisma.productImage.upsert({
      where: { id: `seed-${product.slug}` },
      update: { url: product.image, alt: product.name, sortOrder: 0, isPrimary: true },
      create: { id: `seed-${product.slug}`, productId: saved.id, url: product.image, alt: product.name, sortOrder: 0, isPrimary: true },
    });
    await prisma.productVariant.upsert({
      where: { sku: product.variant.sku },
      update: { productId: saved.id, name: product.variant.name, stock: product.variant.stock, isActive: true },
      create: { productId: saved.id, name: product.variant.name, sku: product.variant.sku, stock: product.variant.stock },
    });
  }

  const permissions = ["products.read", "products.write", "orders.read", "orders.write", "customers.read", "content.write", "settings.write"];
  for (const key of permissions) await prisma.permission.upsert({ where: { key }, update: {}, create: { key } });
  const adminRole = await prisma.role.upsert({ where: { name: "Administrator" }, update: {}, create: { name: "Administrator", description: "Full store administration" } });
  await prisma.role.update({ where: { id: adminRole.id }, data: { permissions: { connect: await prisma.permission.findMany({ where: { key: { in: permissions } }, select: { id: true } }) } } });

  await prisma.setting.upsert({ where: { key: "store.currency" }, update: { value: "INR" }, create: { key: "store.currency", value: "INR" } });
  await prisma.setting.upsert({ where: { key: "store.name" }, update: { value: "ATELIER" }, create: { key: "store.name", value: "ATELIER" } });

  await prisma.user.upsert({
    where: { email: "demo@atelier.local" },
    update: { firstName: "Demo", lastName: "Customer", isActive: true },
    create: { email: "demo@atelier.local", passwordHash: await hashPassword("Demo@12345"), firstName: "Demo", lastName: "Customer", role: UserRole.CUSTOMER },
  });

  await prisma.adminUser.upsert({
    where: { email: "admin@atelier.local" },
    update: { name: "ATELIER Admin", isActive: true, roleId: adminRole.id },
    create: { email: "admin@atelier.local", passwordHash: await hashPassword("Admin@12345"), name: "ATELIER Admin", roleId: adminRole.id },
  });

  console.log("Seed complete.");
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
