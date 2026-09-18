ATELIER PRODUCT PAGE UI FIX — V2

Target:
D:\cloth\premium-store

This is a targeted patch for the product page shown in the screenshots.

It changes ONLY:
app\components\product-page-client.tsx

It:
- Adds a visible "Add to wishlist" button beside Share.
- Uses the existing POST /api/wishlist endpoint.
- Sends the current productId.
- Sends unauthenticated users to login with a return path.
- Fixes the quantity decrement button so it displays "-".
- Removes the hard-coded/fake "★★★★★ 5.0 (0)" rating row.
- Fixes the mojibake characters visible in the size guide, gallery arrows and accordion labels.
- Preserves the existing CSS and page layout.
- Does NOT delete any files.

Apply:
1. Extract this ZIP.
2. Open PowerShell.
3. Run:
   powershell -ExecutionPolicy Bypass -File .\APPLY-PRODUCT-PAGE-FIX.ps1

Then:
npm run typecheck
npm run build
