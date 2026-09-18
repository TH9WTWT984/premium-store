const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  { name: 'T-Shirts', slug: 't-shirts', sortOrder: 10, description: 'Everyday T-shirts in considered silhouettes, graphics and fabrics.', imageUrl: '/images/tshirts/01-plain.jpg' },
  { name: 'Shirts', slug: 'shirts', sortOrder: 20, description: 'Shirts ranging from plain and checked to linen and printed styles.' },
  { name: 'Polos', slug: 'polos', sortOrder: 30, description: 'Refined polo styles for everyday dressing.' },
  { name: 'Jeans', slug: 'jeans', sortOrder: 40, description: 'Boot-cut, straight, formal, narrow, baggy and cargo denim.' },
  { name: 'Lowers', slug: 'lowers', sortOrder: 50, description: 'Parachute, linen, jogger and cotton lower styles.' },
  { name: 'Joggers', slug: 'joggers', sortOrder: 60, description: 'Comfort-led jogger silhouettes for everyday movement.' },
  { name: 'Sneakers', slug: 'sneakers', sortOrder: 70, description: 'Everyday and statement footwear.' },
  { name: 'Linen', slug: 'linen', sortOrder: 80, description: 'Lightweight linen-led essentials.' },
  { name: 'Outerwear', slug: 'outerwear', sortOrder: 90, description: 'Layering pieces designed for changing days.' },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl ?? undefined,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl ?? null,
        sortOrder: category.sortOrder,
        isActive: true,
      },
    });
  }

  console.log(`Created/updated ${categories.length} storefront categories.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
