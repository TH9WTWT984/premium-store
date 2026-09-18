const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const shellPath = path.join(projectRoot, "app", "admin", "components", "admin-shell.tsx");

if (!fs.existsSync(shellPath)) {
  console.error("ERROR: Could not find app/admin/components/admin-shell.tsx");
  process.exit(1);
}

const source = fs.readFileSync(shellPath, "utf8");

if (/href\s*:\s*["']\/admin\/coupons["']/.test(source) || /label\s*:\s*["']Coupons?["']/.test(source)) {
  console.log("Coupons navigation item already exists. No changes made.");
  process.exit(0);
}

const analyticsPattern =
  /(\{\s*label:\s*["']Analytics["']\s*,\s*href:\s*["']\/admin\/analytics["'][^}]*\},)/;

if (!analyticsPattern.test(source)) {
  console.error("ERROR: Could not safely recognize the existing Analytics navigation item.");
  console.error("No files were changed.");
  process.exit(1);
}

const backupPath = shellPath + ".coupon-sidebar-backup";
fs.copyFileSync(shellPath, backupPath);

const couponItem = '  { label: "Coupons", href: "/admin/coupons", icon: "◇" },\n';
const updated = source.replace(analyticsPattern, couponItem + "$1");

fs.writeFileSync(shellPath, updated, "utf8");

console.log("Added Coupons to the existing admin sidebar.");
console.log("Link: /admin/coupons");
console.log("Preserved the existing admin shell and CSS.");
console.log(`Backup created: ${path.relative(projectRoot, backupPath)}`);
