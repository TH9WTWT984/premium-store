const fs = require("fs");
const path = require("path");

const root = process.cwd();
const productFile = path.join(root, "app", "product", "[slug]", "page.tsx");
const categoryFile = path.join(root, "app", "category", "[slug]", "page.tsx");

function read(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing file: ${file}`);
  }
  return fs.readFileSync(file, "utf8");
}

function write(file, text) {
  fs.writeFileSync(file, text, "utf8");
}

function addImport(text) {
  const importLine =
    'import { productMetadata, categoryMetadata } from "@/lib/seo";';

  if (text.includes(importLine)) return text;

  const lines = text.split(/\r?\n/);
  let lastImport = -1;

  for (let i = 0; i < lines.length; i++) {
    if (/^\s*import\s+/.test(lines[i])) lastImport = i;
  }

  lines.splice(lastImport + 1, 0, importLine);
  return lines.join("\n");
}

function insertBeforeDefault(text, block) {
  if (text.includes("export async function generateMetadata")) {
    return text;
  }

  const match = text.match(/export default async function/);
  if (!match || match.index == null) {
    throw new Error("Could not find `export default async function`.");
  }

  return text.slice(0, match.index) + block + "\n" + text.slice(match.index);
}

function patchProduct() {
  let text = read(productFile);
  text = addImport(text);

  const block = `export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<import("next").Metadata> {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      shortDescription: true,
      seoTitle: true,
      seoDescription: true,
      slug: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 1,
        select: { url: true },
      },
      status: true,
    },
  });

  if (!product || product.status !== "ACTIVE") {
    return {
      title: "Product not found — ATELIER",
      robots: { index: false, follow: false },
    };
  }

  return productMetadata({
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    slug: product.slug,
    imageUrl: product.images[0]?.url || null,
  });
}

`;

  text = insertBeforeDefault(text, block);
  write(productFile, text);
}

function patchCategory() {
  let text = read(categoryFile);
  text = addImport(text);

  const block = `export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<import("next").Metadata> {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      imageUrl: true,
      slug: true,
      isActive: true,
    },
  });

  if (!category || !category.isActive) {
    return {
      title: "Collection not found — ATELIER",
      robots: { index: false, follow: false },
    };
  }

  return categoryMetadata({
    name: category.name,
    description: category.description,
    slug: category.slug,
    imageUrl: category.imageUrl,
  });
}

`;

  text = insertBeforeDefault(text, block);
  write(categoryFile, text);
}

const backups = [];
for (const file of [productFile, categoryFile]) {
  if (fs.existsSync(file)) {
    const backup = `${file}.phase22-2.bak`;
    fs.copyFileSync(file, backup);
    backups.push(backup);
  }
}

patchProduct();
patchCategory();

console.log("Phase 22.2 metadata integration applied.");
console.log("Backups created:");
for (const backup of backups) console.log(`- ${backup}`);
