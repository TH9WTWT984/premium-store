const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const targets = [
  "app/account/orders/[id]/page.tsx",
  "app/checkout/payment/[orderId]/page.tsx",
  "app/components/address-autocomplete-styles.tsx",
  "app/components/checkout-form.tsx",
  "app/components/phase6-styles.tsx",
  "app/components/phase7-styles.tsx",
  "app/api/admin/auth/login/route.ts",
  "app/api/admin/categories/route.ts",
  "app/api/admin/categories/[id]/route.ts",
  "app/api/admin/coupons/route.ts",
  "app/api/admin/coupons/[id]/route.ts",
  "app/api/admin/inventory/route.ts",
  "app/api/admin/orders/[id]/route.ts",
  "app/api/admin/products/route.ts",
  "app/api/admin/products/[id]/route.ts",
  "app/api/admin/reviews/[id]/route.ts",
  "app/api/admin/uploads/route.ts",
  "app/api/auth/login/route.ts",
  "app/api/auth/register/route.ts",
  "app/api/cart/items/route.ts",
  "app/api/checkout/route.ts",
  "app/api/coupons/validate/route.ts",
  "app/api/payments/razorpay/create-order/route.ts",
  "app/api/payments/razorpay/verify/route.ts",
  "app/api/products/[productId]/reviews/route.ts",
  "app/api/wishlist/route.ts",
  "app/account/logout-button.tsx",
  "app/admin/admins/admins-manager.tsx",
  "app/admin/dashboard/logout-button.tsx",
  "app/admin/roles/roles-manager.tsx",
];

function read(relative) {
  const absolute = path.join(projectRoot, relative);
  if (!fs.existsSync(absolute)) return null;
  return fs.readFileSync(absolute, "utf8");
}

function lineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function snippet(text, index, before = 2, after = 8) {
  const lines = text.split(/\r?\n/);
  const line = lineNumber(text, index);
  const from = Math.max(1, line - before);
  const to = Math.min(lines.length, line + after);
  return {
    line,
    text: lines.slice(from - 1, to)
      .map((value, i) => `${String(from + i).padStart(4, " ")} | ${value}`)
      .join("\n"),
  };
}

const findings = [];

for (const relative of targets) {
  const text = read(relative);
  if (text == null) continue;

  for (const match of text.matchAll(/dangerouslySetInnerHTML\s*=\s*\{\s*\{([\s\S]{0,700})\}\s*\}/g)) {
    const value = match[1].trim();
    const offset = match.index ?? 0;
    const likelyStatic =
      /styles|css|style|const|static|<style|template/i.test(value) &&
      !/\b(user|body|params|request|query|searchParams|input|message|description|content|html)\b/i.test(value);

    findings.push({
      type: "XSS_REVIEW",
      file: relative,
      line: lineNumber(text, offset),
      severity: likelyStatic ? "LOW" : "HIGH",
      detail: likelyStatic
        ? "dangerouslySetInnerHTML appears likely to be static/style content; verify it is not derived from user/admin input."
        : "dangerouslySetInnerHTML expression may contain dynamic data; inspect for sanitization/trust boundary.",
      snippet: snippet(text, offset).text,
    });
  }

  for (const match of text.matchAll(/(?:await\s+)?request\.(json|formData)\(\)/g)) {
    const offset = match.index ?? 0;
    const start = Math.max(0, offset - 1600);
    const local = text.slice(start, Math.min(text.length, offset + 2600));
    const hasZod =
      /\b(?:z\.|zod|safeParse|parse)\b/.test(local) ||
      /\b(?:schema|validator|validate)\w*\s*\./i.test(local);
    findings.push({
      type: "INPUT_VALIDATION_REVIEW",
      file: relative,
      line: lineNumber(text, offset),
      severity: hasZod ? "INFO" : "REVIEW",
      detail: hasZod
        ? "A schema/validation call appears near request parsing; the first audit was likely a false positive."
        : "Request body is parsed here without an obvious nearby Zod/schema validation call. Inspect field-by-field validation and types.",
      snippet: snippet(text, offset).text,
    });
  }
}

for (const relative of [
  "app/account/logout-button.tsx",
  "app/admin/admins/admins-manager.tsx",
  "app/admin/dashboard/logout-button.tsx",
  "app/admin/roles/roles-manager.tsx",
]) {
  const text = read(relative);
  if (text == null) continue;
  for (const match of text.matchAll(/fetch\([\s\S]{0,900}?\)/g)) {
    const block = match[0];
    if (/\bmethod\s*:\s*["'](?:POST|PUT|PATCH|DELETE)["']/i.test(block) &&
        !/\bbody\s*:/.test(block)) {
      findings.push({
        type: "STATE_FETCH_REVIEW",
        file: relative,
        line: lineNumber(text, match.index ?? 0),
        severity: "LOW",
        detail: "State-changing fetch has no body. Missing Content-Type is usually harmless when there is no JSON/form body; verify the endpoint instead of adding a header blindly.",
        snippet: snippet(text, match.index ?? 0).text,
      });
    }
  }
}

// Environment / Git safety.
const envPath = path.join(projectRoot, ".env");
const gitIgnorePath = path.join(projectRoot, ".gitignore");
const envExists = fs.existsSync(envPath);
const gitIgnore = fs.existsSync(gitIgnorePath) ? fs.readFileSync(gitIgnorePath, "utf8") : "";
let trackedEnv = false;

try {
  const { execFileSync } = require("child_process");
  const tracked = execFileSync("git", ["ls-files", ".env", ".env.*"], {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
  trackedEnv = Boolean(tracked);
} catch {
  // Not a git worktree or git unavailable.
}

findings.push({
  type: "ENV_SAFETY",
  file: ".env",
  line: 1,
  severity: trackedEnv ? "CRITICAL" : "REVIEW",
  detail: trackedEnv
    ? ".env or an env variant is tracked by Git. Remove it from tracking and rotate exposed credentials immediately."
    : envExists
      ? "Local .env exists and is not reported as tracked. Confirm .env and .env.* are ignored before committing."
      : "No local .env file found.",
  snippet: gitIgnore || "(No .gitignore file found)",
});

const report = [];
report.push("# ATELIER PHASE 21 — DEEP SECURITY AUDIT");
report.push("");
report.push("This audit is READ-ONLY. It does not modify application files.");
report.push("");
report.push(`Reviewed ${findings.length} targeted items.`);
report.push("");
for (const finding of findings) {
  report.push(`## [${finding.severity}] ${finding.type}`);
  report.push(`File: ${finding.file}${finding.line ? `:${finding.line}` : ""}`);
  report.push(finding.detail);
  report.push("```");
  report.push(finding.snippet);
  report.push("```");
  report.push("");
}
report.push("INTERPRETATION:");
report.push("- The original 31-item report contains heuristic matches, not 31 confirmed vulnerabilities.");
report.push("- Do not add Content-Type to bodyless DELETE/POST-style requests just to silence the first audit.");
report.push("- Static style injection can be acceptable when the content is fixed code-owned CSS, but dynamic/admin/user data must be sanitized before dangerouslySetInnerHTML.");
report.push("- Missing Zod import does not automatically mean missing validation; this report captures the actual local context.");
report.push("- A tracked .env is an urgent real issue because credentials can enter source control.");
report.push("");

fs.writeFileSync(
  path.join(projectRoot, "phase21-deep-security-audit.txt"),
  report.join("\n"),
  "utf8",
);

const counts = findings.reduce((acc, item) => {
  acc[item.severity] = (acc[item.severity] || 0) + 1;
  return acc;
}, {});

console.log("Deep security audit complete.");
console.log(`Output: ${path.join(projectRoot, "phase21-deep-security-audit.txt")}`);
console.log(`High: ${counts.HIGH || 0}`);
console.log(`Critical: ${counts.CRITICAL || 0}`);
console.log(`Review: ${counts.REVIEW || 0}`);
console.log(`Low: ${counts.LOW || 0}`);
console.log(`Info: ${counts.INFO || 0}`);
