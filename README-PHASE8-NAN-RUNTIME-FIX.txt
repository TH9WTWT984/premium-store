ATELIER — PHASE 8 NaN RUNTIME FIX

TYPE: PATCH ONLY

IMPORTANT:
This is a HOTFIX for the runtime error:
"payableAmount is not defined"

WORKING PROJECT:
D:\cloth\premium-store

THIS PATCH REPLACES:
app\components\razorpay-checkout.tsx

WHAT IT FIXES:
- Removes the undefined payableAmount reference.
- Uses a validated safeAmount derived from the existing amount prop.
- Prevents NaN / invalid amounts from ever being rendered.
- Keeps the real server-created order total in the payment UI.
- Validates the Razorpay gateway amount before opening checkout.
- Does not change the Razorpay API routes, checkout API, database, cart, address autocomplete, or schema.

INSTALL:
1. Stop the dev server with Ctrl+C.
2. Extract this ZIP directly into:
   D:\cloth\premium-store
3. Replace the existing file when Windows asks.
4. Start again:
   cd /d D:\cloth\premium-store
   npm run dev
5. Refresh the checkout/payment page.

EXPECTED:
- No "payableAmount is not defined" runtime error.
- No standalone ₹NaN.
- Button displays: Pay ₹X.XX securely
- Razorpay still opens normally.
