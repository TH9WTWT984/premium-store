const fs = require("fs");
const path = require("path");

const root = process.cwd();
const includeExt = /\.(ts|tsx|js|jsx)$/;

const findings = [];
const files = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (includeExt.test(entry.name)) files.push(file);
  }
}

walk(path.join(root, "app"));
walk(path.join(root, "lib"));

function add(file, category, detail) {
  findings.push({
    file: path.relative(root, file),
    category,
    detail,
  });
}

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");

  if (/dangerouslySetInnerHTML\s*=/.test(text)) {
    add(file, "XSS", "Uses dangerouslySetInnerHTML; verify the value is trusted/sanitized.");
  }

  if (/process\.env\.[A-Z0-9_]+/.test(text)) {
    // Informational only; secret exposure is checked separately below.
  }

  if (/fetch\([^)]*method:\s*["'](?:POST|PUT|PATCH|DELETE)["']/s.test(text) &&
      !/headers:\s*\{[^}]*["']Content-Type["']/s.test(text)) {
    add(file, "API", "State-changing fetch without an explicit Content-Type header; inspect whether the body is intentional.");
  }

  if (/zod|z\.object|safeParse|parse\(/.test(text) === false &&
      /request\.(json|formData)\(\)/.test(text)) {
    add(file, "VALIDATION", "Reads request data without an obvious Zod/schema validation call in this file.");
  }

  if (/new URLSearchParams|URLSearchParams/.test(text) && /request\.url|searchParams/.test(text)) {
    // informational
  }

  if (/console\.(log|error|warn)\([^)]*(?:password|token|secret|apiKey|authorization)/i.test(text)) {
    add(file, "SECRETS", "Potential secret/token logging. Review immediately.");
  }
}

const envFiles = [".env", ".env.local", ".env.production", ".env.development"];
for (const name of envFiles) {
  const file = path.join(root, name);
  if (fs.existsSync(file)) {
    const text = fs.readFileSync(file, "utf8");
    const secretKeys = text
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=/)?.[1])
      .filter(Boolean)
      .filter((key) => /SECRET|PASSWORD|API_KEY|TOKEN|DATABASE_URL/i.test(key));
    if (secretKeys.length) {
      add(file, "ENV", `Contains ${secretKeys.length} secret-like environment variable(s). These should never be committed.`);
    }
  }
}

const summary = [
  "# ATELIER PHASE 21 SECURITY AUDIT",
  "",
  "This is a READ-ONLY audit script. It does not modify project files.",
  "",
  `Scanned ${files.length} source files.`,
  `Found ${findings.length} items for review.`,
  "",
];

if (!findings.length) {
  summary.push("No automated findings. This does not prove the application is secure; perform the manual test checklist in the README.");
} else {
  for (const f of findings) {
    summary.push(`[${f.category}] ${f.file} — ${f.detail}`);
  }
}

const reportPath = path.join(root, "phase21-security-audit-report.txt");
fs.writeFileSync(reportPath, summary.join("\n"), "utf8");

console.log(`Security audit complete. Report: ${reportPath}`);
console.log(`Scanned ${files.length} source files. Findings: ${findings.length}`);
