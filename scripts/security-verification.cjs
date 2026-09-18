const fs = require("fs");
const path = require("path");

const root = process.cwd();
const checks = [];

function add(name, pass, detail) {
  checks.push({ name, pass, detail });
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function read(rel) {
  const file = path.join(root, rel);
  return exists(rel) ? fs.readFileSync(file, "utf8") : "";
}

// File presence / architecture checks.
add(
  "Payment request schemas",
  exists("lib/validation/payment.ts"),
  "Dedicated Zod payment schemas should exist."
);

add(
  "Razorpay signature verification",
  /createHmac\(\s*["']sha256["']/.test(read("app/api/payments/razorpay/verify/route.ts")),
  "Checkout payment verification should calculate a server-side HMAC."
);

add(
  "Server-side Razorpay order binding",
  /providerPaymentId\s*!==\s*razorpayOrderId/.test(
    read("app/api/payments/razorpay/verify/route.ts")
  ),
  "The browser-supplied Razorpay order ID should be matched to the server-stored provider order ID."
);

add(
  "Authenticated payment ownership",
  /userId:\s*user\.id/.test(read("app/api/payments/razorpay/verify/route.ts")),
  "Payment verification should only operate on the authenticated user's order."
);

add(
  "Atomic payment claim",
  /payment\.updateMany/.test(read("app/api/payments/razorpay/verify/route.ts")) &&
  /status:\s*["']PENDING["']/.test(read("app/api/payments/razorpay/verify/route.ts")),
  "Payment completion should be claimed conditionally from PENDING."
);

add(
  "Conditional stock decrement",
  /stock:\s*\{\s*gte:\s*item\.quantity\s*\}/.test(
    read("app/api/payments/razorpay/verify/route.ts")
  ) &&
  /decrement:\s*item\.quantity/.test(
    read("app/api/payments/razorpay/verify/route.ts")
  ),
  "Stock decrement should only occur when enough stock exists."
);

add(
  "Webhook raw-body verification",
  /await request\.text\(\)/.test(read("app/api/webhooks/razorpay/route.ts")) &&
  /x-razorpay-signature/.test(read("app/api/webhooks/razorpay/route.ts")),
  "Webhook verification should use the raw body and Razorpay signature header."
);

add(
  "Webhook rejects invalid signature",
  /Invalid webhook signature/.test(read("app/api/webhooks/razorpay/route.ts")),
  "Invalid webhook signatures should be rejected."
);

add(
  "Webhook duplicate guard",
  /payment\.status\s*===\s*["']PAID["']/.test(
    read("app/api/webhooks/razorpay/route.ts")
  ),
  "Already-paid payments should not be processed again."
);

add(
  "Admin permission boundary",
  /permissions\.some/.test(read("app/api/admin/products/route.ts")) &&
  /products\.write/.test(read("app/api/admin/products/route.ts")),
  "Admin product writes should verify permission on the server."
);

add(
  "Customer order ownership",
  /userId:\s*user\.id/.test(read("app/account/orders/[id]/page.tsx")),
  "Customer order pages should scope lookup to the logged-in user."
);

add(
  "Environment secret handling",
  !/(RAZORPAY_KEY_SECRET|RAZORPAY_WEBHOOK_SECRET)\s*=\s*.+/.test(read(".env.example")),
  ".env.example should contain placeholders rather than real secrets."
);

// Static scan for risky direct client trust in payment status.
const paymentFiles = [
  "app/api/payments/razorpay/create-order/route.ts",
  "app/api/payments/razorpay/verify/route.ts",
  "app/api/webhooks/razorpay/route.ts",
];

for (const rel of paymentFiles) {
  const text = read(rel);
  if (!text) continue;

  add(
    `${rel} does not mark paid from a browser-only success flag`,
    !/body\??\.\s*(success|paid|status)\s*===?\s*["']PAID["']/i.test(text),
    "No obvious browser-only paid flag was found."
  );
}

const passed = checks.filter((c) => c.pass).length;
const failed = checks.length - passed;

const lines = [
  "# ATELIER PHASE 21 — SECURITY VERIFICATION REPORT",
  "",
  "This is a static verification helper, not a penetration test.",
  "",
  `Checks: ${checks.length}`,
  `Passed: ${passed}`,
  `Failed: ${failed}`,
  "",
];

for (const c of checks) {
  lines.push(`${c.pass ? "[PASS]" : "[REVIEW]"} ${c.name}`);
  lines.push(`  ${c.detail}`);
}

lines.push("");
lines.push("MANUAL TESTS STILL REQUIRED:");
lines.push("1. Attempt customer access to another customer's order ID; expect 404/not found.");
lines.push("2. Send an invalid Razorpay signature to /api/payments/razorpay/verify; expect rejection.");
lines.push("3. Send an invalid Razorpay webhook signature; expect rejection.");
lines.push("4. Replay a paid webhook/payment completion; it must not decrement stock again.");
lines.push("5. Try quantity 0, negative, decimal, or >99 through cart mutation; expect rejection.");
lines.push("6. Tamper with checkout totals in browser devtools; server amount must remain authoritative.");
lines.push("7. Attempt an admin write while unauthenticated or without permission; expect 401/403.");
lines.push("8. Confirm real secrets are not tracked by Git.");
lines.push("");
lines.push("A PASS here means the expected code pattern was found. It is not a production security certification.");

fs.writeFileSync(
  path.join(root, "phase21-security-verification.txt"),
  lines.join("\n"),
  "utf8"
);

console.log(`Security verification complete: ${passed}/${checks.length} static checks passed.`);
console.log(`Report: ${path.join(root, "phase21-security-verification.txt")}`);
