import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
(async () => {
  const cats = await p.category.findMany({ orderBy: { sortOrder: "asc" } });
  console.log("CATEGORIES:", cats.length);
  for (const c of cats) console.log("  ", c.slug, "|", c.name, "| active:", c.isActive, "| sort:", c.sortOrder, "| products:", await p.product.count({where:{categoryId:c.id}}), "| img:", c.imageUrl);
  const prods = await p.product.findMany({ include: { images: true, variants: true, category: {select:{slug:true}} } });
  console.log("\nPRODUCTS:", prods.length);
  for (const pr of prods) console.log("  ", pr.slug, "|", pr.name, "| ", pr.status, "| feat:", pr.featured, "| cat:", pr.category.slug, "| imgs:", pr.images.length, "| variants:", pr.variants.map(v=>`${v.name}:${v.stock}${v.isActive?"":"(inactive)"}`).join(","));
  console.log("\nIMAGES:", JSON.stringify(await p.productImage.findMany()));
  console.log("\nORDERS:", await p.order.count(), "USERS:", await p.user.count(), "MEDIA:", await p.media.count(), "CMS:", await p.cmsHomepage.count(), "CMSPages:", await p.cmsPage.count());
  console.log("\nADMINS:", JSON.stringify(await p.adminUser.findMany({ select: { email:true, name:true, isActive:true, role:{select:{name:true}} } })));
  console.log("\nROLES:", JSON.stringify(await p.role.findMany({ include: { permissions: {select:{key:true}} } })));
  const ops = await p.order.findMany({ take: 5, orderBy: {createdAt:"desc"}, include: { payment: true, items: true } });
  console.log("\nRECENT ORDERS:", JSON.stringify(ops));
  await p.$disconnect();
})().catch(e => { console.error("ERR", e.message); process.exit(1); });
