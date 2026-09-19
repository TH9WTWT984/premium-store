const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' }
  });
  console.log('=== CATEGORIES (' + categories.length + ') ===');
  categories.forEach(c => {
    console.log(`- [${c.slug}] "${c.name}": imageUrl="${c.imageUrl}" (isActive: ${c.isActive})`);
  });

  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { orderBy: { createdAt: 'asc' } }
    },
    orderBy: { createdAt: 'asc' }
  });
  console.log('\n=== PRODUCTS (' + products.length + ') ===');
  products.forEach(p => {
    console.log(`\nProduct: "${p.name}" (slug: ${p.slug}, status: ${p.status}, price: ${p.price}, category: ${p.category?.name})`);
    console.log(`  Images (${p.images.length}):`, p.images.map(img => img.url));
    console.log(`  Variants (${p.variants.length}):`, p.variants.map(v => `${v.name} (SKU: ${v.sku}, stock: ${v.stock})`));
  });
}

run().catch(console.error).finally(() => prisma.$disconnect());
