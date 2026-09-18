const fs = require('fs');
const path = require('path');
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');
const modelStart = schema.indexOf('model CmsHomepage');
if (modelStart < 0) throw new Error('model CmsHomepage not found in prisma/schema.prisma');
const nextModel = schema.indexOf('\nmodel ', modelStart + 6);
const end = nextModel < 0 ? schema.length : nextModel;
const block = schema.slice(modelStart, end);
if (!/\bthemeConfig\s+String/.test(block)) {
  const updated = block.replace(/(\n\s*updatedAt\s+DateTime[^\n]*)(\n)/, '$1\n  themeConfig     String   @default("{}")$2');
  if (updated === block) throw new Error('Could not find updatedAt field inside CmsHomepage');
  schema = schema.slice(0, modelStart) + updated + schema.slice(end);
  fs.writeFileSync(schemaPath, schema);
  console.log('Added CmsHomepage.themeConfig to prisma/schema.prisma');
} else {
  console.log('CmsHomepage.themeConfig already exists');
}
