const fs = require('fs');
const path = require('path');
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');
if (!schema.includes('model CmsPage')) {
  schema += `\n\nmodel CmsPage {\n  id             String   @id @default(cuid())\n  slug           String   @unique\n  title          String\n  eyebrow        String?\n  excerpt        String?\n  content        String\n  seoTitle       String?\n  seoDescription String?\n  status         String   @default("DRAFT")\n  createdAt      DateTime @default(now())\n  updatedAt      DateTime @updatedAt\n  @@index([status])\n  @@index([updatedAt])\n}\n`;
  fs.writeFileSync(schemaPath, schema);
  console.log('Added CmsPage model to prisma/schema.prisma');
} else console.log('CmsPage model already exists');
