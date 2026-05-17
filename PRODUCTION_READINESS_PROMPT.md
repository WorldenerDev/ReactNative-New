# Production readiness: removing static & test payment data

Use this file when your **real backend APIs** are ready. Paste the prompt below into Cursor so dev/test-only payment behavior is removed and wired to production endpoints.

---

## Must delete / remove (production checklist)

### 1. Local Stripe test server

| What | Where |
|------|--------|
| Dev HTTP server | `scripts/stripe-dev-server.js` |
| npm script | `"stripe-server": "node scripts/stripe-dev-server.js"` in `package.json` |
| Server-only env | `STRIPE_SECRET_KEY`, `STRIPE_DEV_SERVER_PORT` (default `4242`) in `.env` |
| Node `stripe` package | `devDependencies.stripe` in `package.json` — only used by the dev server; remove when the server is deleted |
| App → dev server wiring | `STRIPE_PAYMENT_BACKEND_URL` in `.env` + `src/config/stripe.js` |
| Client POST helper | `postPaymentBackend()` in `src/services/payment/paymentApi.js` |
| Dev-server route names | `/create-setup-intent`, `/create-payment-intent`, `/list-payment-methods`, `/detach-payment-method` — replace with your real API paths |
| Backend flag helper | `isPaymentBackendConfigured()` in `paymentApi.js` / `usePayments.js` |

**Keep:** `scripts/loadEnvFile.js` (used by `metro.config.js` for local env loading).

**Delete (optional dev docs):** `STRIPE_PAYMENT_REIMPLEMENTATION_PROMPT.md` — handoff notes for the mock implementation; not needed in production.

---

### 2. Static / in-memory card list & mock payment flows

| What | Where |
|------|--------|
| In-memory card store | `mockStoredCards`, `appendMockSavedCard()` in `paymentApi.js` |
| Mock client secrets | `MOCK_CLIENT_SECRET_PREFIX`, `isMockClientSecret()`, `MOCK_DELAY_MS`, mock fallbacks in `createSetupIntent` / `createPaymentIntent` / `listPaymentMethods` / `deletePaymentMethod` |
| Merge mock + remote | `mergePaymentMethodItems()` in `paymentApi.js` |
| Dev hook helpers | `addDevelopmentCard()` in `src/hooks/usePayments.js` |
| Mock add-card path | `isMockClientSecret` branch in `addCard()` — skips real `confirmSetupIntent`, writes fake `mock_pm_*` ids |
| Mock pay path | `isMockClientSecret` branch in `pay()` — fake success after delay, no real charge |
| Redux dev shortcut | `addLocalCard` reducer in `src/redux/slices/paymentSlice.js` (if unused after cleanup, remove) |
| “Add mock test card” UI | `src/screens/Main/Payment.jsx` |
| “Add mock test card” UI | `src/screens/Main/PaymentMethods.jsx` |
| Mock-only Add card screen | `src/screens/Main/AddCard.jsx` — `handleMockOnly`, no-key branch with in-memory mock copy |
| Legacy save-card screen | `src/screens/Main/SaveCard.jsx` — separate flow (`createPaymentMethod`), mock messaging; consolidate on `AddCard` + real API or remove `SAVE_CARD` route |
| JSDoc / contracts | `src/services/payment/contracts.js` — “mock id” wording; align types with real API |

Saved cards and client secrets must come **only** from your backend after cleanup.

---

### 3. Static test customer id

| What | Where |
|------|--------|
| Env var | `STRIPE_TEST_CUSTOMER_ID=cus_…` in `.env` |
| Bundled export | `STRIPE_TEST_CUSTOMER_ID` in `src/config/stripe.js` (inlined via `babel-plugin-inline-dotenv`) |
| Default customer helper | `defaultCustomerId()` in `paymentApi.js` — must read from backend/session, not env |

The app must not ship a hard-coded `cus_…`. Customer id for SetupIntent / PaymentIntent / list should come from your API (logged-in user or checkout session).

---

### 4. Other production gaps (not “static data” but must be fixed)

| What | Where | Notes |
|------|--------|--------|
| Placeholder post-pay booking | `src/screens/Main/Payment.jsx` | After `pay()` succeeds, calls `createOrder` then **`createNoPayment`** — records booking without telling your backend about the Stripe payment. Replace with your real “confirm payment / complete order” API. |
| HTTP allowed on iOS | `ios/WApp/Info.plist` | `NSAllowsArbitraryLoads` + `NSAllowsLocalNetworking` were added for LAN dev server. Revert or tighten for production (HTTPS only). **Requires iOS rebuild.** |
| Cleartext on Android (debug) | `android/app/src/debug/AndroidManifest.xml` | `usesCleartextTraffic="true"` — acceptable for debug; ensure release does not allow cleartext to dev IPs. |
| Test Stripe keys | `.env` | `pk_test_…` / `sk_test_…` — use `pk_live_…` in release via CI/flavors; never bundle `sk_*` in the app. |
| No-key fallback | `src/components/StripeAppBridge.jsx` | Renders without `StripeProvider` when publishable key is missing — fine for dev; production builds should require a key or show a clear error. |

---

## Copy-paste prompt (fill in the blanks, then send)

```text
Production cleanup: wire payments to our real APIs and remove all dev/test-only payment code.

Backend base URL: <YOUR_API_BASE_URL>
Endpoints (map to what replaced the local stripe-dev-server routes):
- List saved payment methods: <METHOD> <PATH>   (was POST /list-payment-methods)
- Create SetupIntent (add card): <METHOD> <PATH>   (was POST /create-setup-intent)
- Create PaymentIntent (pay): <METHOD> <PATH>   (was POST /create-payment-intent)
- Detach/remove card: <METHOD> <PATH>   (was POST /detach-payment-method)
- Complete order after successful payment: <METHOD> <PATH>   (replaces createNoPayment placeholder in Payment.jsx)
Auth: <Bearer token / session header / how the app already authenticates>
Customer id source: <e.g. from GET /me or checkout session — not from env>

DELETE / remove:
1. Local Stripe test server: scripts/stripe-dev-server.js, npm run stripe-server, devDependencies.stripe, STRIPE_SECRET_KEY, STRIPE_DEV_SERVER_PORT, STRIPE_PAYMENT_BACKEND_URL, postPaymentBackend, isPaymentBackendConfigured, and all dev-server route calls.
2. Static card list & mocks: mockStoredCards, MOCK_* / isMockClientSecret, appendMockSavedCard, mergePaymentMethodItems, addDevelopmentCard, mock delays/fallbacks, addLocalCard if unused, mock UI in Payment.jsx / PaymentMethods.jsx / AddCard.jsx, and mock branches in usePayments addCard/pay.
3. Static customer: STRIPE_TEST_CUSTOMER_ID from .env and src/config/stripe.js; defaultCustomerId() must use backend/session only.
4. Legacy / duplicate: SaveCard.jsx mock path and SAVE_CARD route if AddCard + real API replaces it; delete STRIPE_PAYMENT_REIMPLEMENTATION_PROMPT.md if no longer needed.
5. iOS ATS: revert NSAllowsArbitraryLoads / NSAllowsLocalNetworking in Info.plist unless still required (prefer HTTPS only).
6. Env: production STRIPE_PUBLISHABLE_KEY only in release; no test keys or secrets in app bundle.

WIRE / fix:
7. paymentApi.js → call real backend (axios/mainServices pattern); update contracts.js.
8. Payment.jsx → after successful pay(), call real order/payment completion API instead of createNoPayment.
9. Errors: no silent empty card list when API fails; surface errors via toast + paymentSlice.error.

Keep: @stripe/stripe-react-native, StripeAppBridge, PaymentStripeContext, paymentSlice shape, usePayments hook, Payment / PaymentMethods / AddCard screens (minus mock paths).

Match existing project patterns. Focused diff only — payment production readiness.
```

---

## Full file inventory (audit)

Use this as a checklist when reviewing the cleanup PR.

| File | Role today | Production action |
|------|------------|-------------------|
| `scripts/stripe-dev-server.js` | Local Stripe backend | **Delete** |
| `scripts/loadEnvFile.js` | Metro `.env` loader | **Keep** |
| `STRIPE_PAYMENT_REIMPLEMENTATION_PROMPT.md` | Dev handoff doc | **Delete** (optional) |
| `package.json` | `stripe-server` script, `stripe` devDep | Remove script + dep |
| `.env` | Test keys, customer id, dev server URL | Remove test-only vars; `.env` is gitignored |
| `babel.config.js` | Inlines `.env` into app bundle | Keep; only ship production-safe vars |
| `src/config/stripe.js` | Publishable key + test customer + dev URL | Keep publishable key only |
| `src/services/payment/paymentApi.js` | Mock + dev-server client | Rewrite for real API |
| `src/services/payment/contracts.js` | JSDoc types | Align with backend |
| `src/services/payment/index.js` | Re-exports | Update exports if helpers removed |
| `src/hooks/usePayments.js` | Stripe + mock orchestration | Remove mock branches |
| `src/redux/slices/paymentSlice.js` | Cards state + thunks | Keep; thunks call real API |
| `src/redux/store.js` | `payment` reducer | Keep |
| `src/screens/Main/Payment.jsx` | Checkout pay + mock button + createNoPayment | Remove mock; fix post-pay API |
| `src/screens/Main/PaymentMethods.jsx` | Manage cards + mock button | Remove mock |
| `src/screens/Main/AddCard.jsx` | CardField + mock-only path | Remove mock path |
| `src/screens/Main/SaveCard.jsx` | Legacy add card + mock copy | Remove or merge with AddCard |
| `src/components/StripeAppBridge.jsx` | Conditional StripeProvider | Keep; tighten prod behavior |
| `src/context/PaymentStripeContext.js` | Stripe hook context | Keep |
| `App.js` | Wraps StripeAppBridge | Keep |
| `src/navigation/.../MainNavigator.jsx` | Payment routes | Remove SAVE_CARD if deprecated |
| `ios/WApp/Info.plist` | ATS exceptions for HTTP dev | Revert for production |
| `android/app/src/debug/AndroidManifest.xml` | Cleartext debug | Verify release manifest |

---

## Environment variables (after migration)

| Variable | Production |
|----------|------------|
| `STRIPE_PUBLISHABLE_KEY` | **Set** per environment (`pk_live_…` in release) |
| `STRIPE_PAYMENT_BACKEND_URL` | **Remove** — use your real API base URL instead |
| `STRIPE_TEST_CUSTOMER_ID` | **Remove** — customer from backend |
| `STRIPE_SECRET_KEY` | **Never in app** — server only |
| `STRIPE_DEV_SERVER_PORT` | **Remove** with dev server |

Add whatever your team uses for the main API base URL (existing axios `endpoints` pattern in `src/api/`).

---

## Optional follow-ups (non-payment)

When other features still use fixtures or static JSON, add them to a new section here or repeat the same prompt pattern with file paths so a future cleanup pass stays scoped and reviewable.
