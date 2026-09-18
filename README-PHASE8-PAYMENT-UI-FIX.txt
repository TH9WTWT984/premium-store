ATELIER — PHASE 8 PAYMENT UI + NaN FIX

TYPE: PATCH ONLY (NOT a full project)

WORKING PROJECT:
D:\cloth\premium-store

WHAT THIS PATCH REPLACES:
1. app\components\checkout-form.tsx
   - Removes the standalone extra amount shown above the Razorpay button.
   - Replaces the old large/boxy payment-ready state with a cleaner premium UI.
   - Shows the real payable amount once in an "Amount due" row.
   - Button becomes: Pay ₹X.XX securely
   - Preserves the existing city/state autocomplete and PIN lookup.

2. app\components\razorpay-checkout.tsx
   - Prevents NaN from ever being displayed.
   - Validates the amount before opening Razorpay.
   - Uses the actual amount for the button label.

3. app\api\checkout\route.ts
   - Returns the server-created order total to the browser, fixing the root cause of ₹NaN.
   - Stops decrementing inventory before payment. Stock is deducted by the verified payment flow instead.

WHAT IT DOES NOT REPLACE:
- Product pages
- Cart
- Admin panel
- Prisma schema / database migrations
- Razorpay API credentials
- Razorpay create-order / verify endpoints
- Address autocomplete APIs

INSTALLATION (WINDOWS CMD):

1. Stop your dev server with Ctrl+C.

2. Extract this ZIP directly into:
   D:\cloth\premium-store

   IMPORTANT: This is a PATCH. It must be extracted directly into the existing
   premium-store folder. Do NOT extract into a new premium-store folder.

3. When Windows asks whether to replace files, choose YES.

4. Start the project:
   cd /d D:\cloth\premium-store
   npm run dev

5. Open:
   http://localhost:3000/checkout

VERIFY:
- The old standalone ₹NaN above the black button is gone.
- The button shows the real amount, for example: Pay ₹1,499.00 securely
- The payment-ready screen shows the real amount under "Amount due".
- Razorpay opens normally.
- Do not change your Razorpay keys for this patch.
