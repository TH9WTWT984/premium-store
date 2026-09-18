ATELIER — CHECKOUT ADDRESS AUTOCOMPLETE PATCH

TYPE: PATCH

EXTRACT CONTENTS DIRECTLY INTO:
D:\cloth\premium-store

DO NOT extract into D:\cloth or a phase folder.

REPLACES:
- app/components/checkout-form.tsx

ADDS:
- app/api/address/pincode/route.ts
- app/api/address/search/route.ts
- app/components/address-autocomplete-styles.tsx

DO NOT TOUCH:
- .env
- node_modules
- prisma
- migrations
- database
- package.json
- package-lock.json

FEATURES:
- State suggestions while typing.
- City/district suggestions while typing.
- 6-digit Indian PIN lookup.
- PIN lookup fills city/district and state automatically.
- Shows the matched postal office/area.
- Preserves the real Phase 7 order submission.
- No database migration required.

IMPORTANT:
A PIN code identifies a postal area/post office, not a customer's exact house/street address. The street address remains manual.

The app proxies Pincode API requests through Next.js. Current public documentation:
https://api.pincodeapi.in/api/v1/pincode/{pincode}
https://api.pincodeapi.in/api/v1/search/suggest?q={query}

INSTALL:
1. Stop npm run dev with Ctrl+C, then Y.
2. Extract this ZIP directly into D:\cloth\premium-store.
3. Choose Replace if asked.
4. cd /d D:\cloth\premium-store
5. npm run typecheck
6. npm run dev

TEST:
1. Login as the test customer.
2. Add a product to the bag.
3. Open /checkout.
4. Type a state such as "Pun" or "Punjab" and choose a suggestion.
5. Type a city and choose a suggestion.
6. Enter 141001 (or another valid 6-digit PIN).
7. Verify city/state are filled.
8. Complete the address and place one test order.
