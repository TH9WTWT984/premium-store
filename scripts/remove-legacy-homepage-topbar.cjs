const fs = require('fs');
const path = require('path');

const root = process.cwd();
const files = [
  path.join(root, 'app', 'page.tsx'),
  path.join(root, 'app', 'page.jsx'),
  path.join(root, 'app', 'page.js'),
  path.join(root, 'app', 'components', 'store-header.tsx'),
  path.join(root, 'app', 'components', 'store-header.jsx'),
  path.join(root, 'app', 'components', 'store-header.js'),
].filter(fs.existsSync);

const patterns = [
  /\s*<div\s+className=["']topbar["'][^>]*>[\s\S]*?<\/div>\s*/gi,
  /\s*<div\s+className=\{?["']topbar["']\}?[^>]*>[\s\S]*?<\/div>\s*/gi,
];

let changed = 0;
for (const file of files) {
  let source = fs.readFileSync(file, 'utf8');
  const before = source;
  for (const pattern of patterns) source = source.replace(pattern, '\n');
  if (source !== before) {
    fs.writeFileSync(file, source, 'utf8');
    console.log(`Removed legacy topbar from ${path.relative(root, file)}`);
    changed++;
  }
}

if (!changed) {
  console.log('No legacy topbar markup found. The announcement slider remains the only announcement bar.');
}
