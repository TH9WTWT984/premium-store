const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const candidates = [
  path.join(projectRoot, "app", "admin", "components", "admin-shell.tsx"),
  path.join(projectRoot, "app", "admin", "components", "admin-shell.jsx"),
  path.join(projectRoot, "app", "admin", "components", "admin-shell.js"),
];

function findSidebarFile() {
  const direct = candidates.find((file) => fs.existsSync(file));
  if (direct) return direct;

  const roots = [path.join(projectRoot, "app", "admin")];
  const found = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (/\.(tsx|jsx|ts|js)$/.test(entry.name)) found.push(absolute);
    }
  }

  roots.forEach((root) => fs.existsSync(root) && walk(root));

  const scored = found
    .map((file) => {
      const text = fs.readFileSync(file, "utf8");
      let score = 0;
      if (/Overview/.test(text)) score += 2;
      if (/Products/.test(text)) score += 2;
      if (/Categories/.test(text)) score += 2;
      if (/Inventory/.test(text)) score += 2;
      if (/Inquiries/.test(text)) score += 2;
      if (/Homepage/.test(text)) score += 2;
      if (/Analytics/.test(text)) score += 2;
      if (/Sign out|Sign Out/.test(text)) score += 1;
      if (/sidebar|nav/i.test(text)) score += 2;
      return { file, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.score >= 8 ? scored[0].file : null;
}

function makeBackup(file) {
  const backup = `${file}.backup-before-media-sidebar`;
  if (!fs.existsSync(backup)) fs.copyFileSync(file, backup);
  return backup;
}

function alreadyHasMedia(text) {
  return (
    /href\s*=\s*["']\/admin\/media["']/.test(text) ||
    /["']Media["']\s*[,}]/.test(text) && /\/admin\/media/.test(text)
  );
}

function insertInArray(text) {
  const patterns = [
    // Common nav object shape: { label: "Homepage", href: "/admin/homepage", ... }
    /(\{\s*label:\s*["']Homepage["'][\s\S]{0,600}?href:\s*["']\/admin\/homepage["'][\s\S]{0,120}?\})/,
    // Common item shape: { name: "Homepage", href: "/admin/homepage", ... }
    /(\{\s*(?:name|title):\s*["']Homepage["'][\s\S]{0,600}?href:\s*["']\/admin\/homepage["'][\s\S]{0,120}?\})/,
  ];

  const item =
    `\n    { label: "Media", href: "/admin/media", icon: "media" },`;

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const at = match.index + match[0].length;
      return text.slice(0, at) + item + text.slice(at);
    }
  }

  // Fallback: find the actual /admin/homepage Link block and insert after it.
  const homepageHref = /<Link\b[\s\S]{0,500}?href=["']\/admin\/homepage["'][\s\S]{0,1200}?<\/Link>/;
  const linkMatch = text.match(homepageHref);
  if (linkMatch) {
    const at = linkMatch.index + linkMatch[0].length;
    const link = `\n      <Link href="/admin/media" className={styles.navItem ?? "admin-nav-item"}>\n        <span className={styles.navIcon ?? "admin-nav-icon"} aria-hidden="true">▦</span>\n        <span>Media</span>\n      </Link>`;
    return text.slice(0, at) + link + text.slice(at);
  }

  // Last fallback: add a new item immediately after a literal "Homepage" line.
  const line = text.match(/^([ \t]*).*Homepage.*$/m);
  if (line) {
    const insertion = `\n${line[0].replace("Homepage", "Media")}`;
    const pos = line.index + line[0].length;
    return text.slice(0, pos) + insertion + text.slice(pos);
  }

  return null;
}

const file = findSidebarFile();

if (!file) {
  console.error(
    "Could not safely locate the admin sidebar component. No files were changed."
  );
  process.exit(2);
}

let text = fs.readFileSync(file, "utf8");

if (alreadyHasMedia(text)) {
  console.log(`Media sidebar link already exists in ${path.relative(projectRoot, file)}. Nothing changed.`);
  process.exit(0);
}

const updated = insertInArray(text);

if (!updated) {
  console.error(
    `Found ${path.relative(projectRoot, file)}, but could not safely identify the sidebar navigation block. No files were changed.`
  );
  process.exit(3);
}

const backup = makeBackup(file);
fs.writeFileSync(file, updated, "utf8");

console.log("Media sidebar item added.");
console.log(`Updated: ${path.relative(projectRoot, file)}`);
console.log(`Backup:  ${path.relative(projectRoot, backup)}`);
console.log("Target:  /admin/media");
