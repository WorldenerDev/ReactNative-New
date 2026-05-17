# Stripe + payment flow — full reimplementation handoff

Use this document when you need to redo the work on another branch (or hand it to an AI). It combines **product/engineering requirements**, **iOS/Xcode 26 constraints**, and **concrete file-level steps** so the implementation can be completed in one pass.

---

## 1. Copy-paste master prompt (send this whole block)

```text
You are implementing Stripe-backed payments in a React Native 0.81 app (New Architecture enabled). Follow the repo’s existing patterns (navigation, MainContainer, Header, showToast, Redux Toolkit, @ path aliases).

GOALS
1) Mock payment API layer under src/services/payment/ with JSDoc contracts: createSetupIntent, createPaymentIntent, listPaymentMethods, deletePaymentMethod, and any helpers needed. Use a MOCK_CLIENT_SECRET_PREFIX (e.g. "mock_") on client secrets so the app can branch: mock secrets skip real Stripe.confirmPayment/confirmSetupIntent and resolve with fake success after a short delay. Export from src/services/payment/index.js. Keep TODOs for real backend URLs.

2) src/config/stripe.js — STRIPE_PUBLISHABLE_KEY (from env or empty string). Document that Metro needs the env var if using process.env.

3) Redux: src/redux/slices/paymentSlice.js — state for cards list, selected card id, loading/error, optional cart/order context; actions/thunks that call paymentApi; register reducer in src/redux/store.js.

4) Hook: src/hooks/usePayments.js — addCard (SetupIntent + confirmSetupIntent or mock), getCards, selectCard, pay (PaymentIntent + confirmPayment or mock), deleteCard, addDevelopmentCard (optional convenience), guard double-taps. Use useStripe from @stripe/stripe-react-native. Branch on isMockClientSecret.

5) Screens:
   - src/screens/Main/PaymentMethods.jsx — list saved cards, select default, delete, navigate to Add Card.
   - src/screens/Main/AddCard.jsx — CardField from @stripe/stripe-react-native, collect and confirm setup (or mock).
   - Update src/screens/Main/Payment.jsx — use Redux + usePayments; replace hardcoded card list; entry to PaymentMethods / AddCard; pay flow using selected card.
   - Update src/screens/Main/CartCustomerInfo.jsx — when navigating to Payment, pass route params the Payment screen needs (e.g. cart_id, trip_id, amount/currency if applicable).

6) Navigation:
   - Add navigationStrings.PAYMENT_METHODS and navigationStrings.ADD_CARD.
   - Register screens in MainNavigator.jsx (and src/screens/index.js exports if that pattern exists).

7) App entry:
   - Wrap the app with StripeProvider only when STRIPE_PUBLISHABLE_KEY is non-empty; otherwise render children without StripeProvider so dev without keys still runs. Import publishable key from src/config/stripe.js (or equivalent).

8) Aliases: ensure babel-plugin-module-resolver and jsconfig.json include "@services": "./src/services" (or import payment modules with an existing alias — be consistent).

9) Dependencies:
   - Set @stripe/stripe-react-native to ^0.65.1 (required for Xcode 26 / Apple Clang 21 — older 0.45.x hits STPPaymentStatus enum redeclaration with Stripe iOS 24.x). Run npm install.
   - iOS: cd ios && bundle exec pod install. If Podfile.lock pins Stripe 24.x and CocoaPods errors on Stripe version, run: bundle exec pod update Stripe StripeApplePay StripeCore StripeFinancialConnections StripePayments StripePaymentSheet StripePaymentsUI StripeUICore stripe-react-native --repo-update

10) iOS build (Xcode 26+):
   - Ensure fmt / consteval does not break the build. If the Podfile already sets CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES=YES and fmt preprocessor FMT_USE_CONSTEVAL=0 on the fmt target, keep that. Otherwise add a post_install patch on ios/Pods/fmt/include/fmt/base.h replacing "#  define FMT_USE_CONSTEVAL 1" with 0 using a regex that allows optional spaces after # (fmt uses "#  define").
   - After pods, verify simulator build.

11) Do not expand scope beyond payments/navigation/App wiring. Match code style of neighboring files. No new markdown files unless asked.

VERIFY: npx react-native run-ios from repo root with sufficient disk space; PaymentMethods → AddCard → Payment pay path works with mock API; real key path calls Stripe when client secrets are not mock_.
```

---

## 2. Why this matters (short context)

| Issue | Cause | Fix |
|--------|--------|-----|
| `enumeration redeclared with different underlying type 'NSInteger' … 'NSUInteger'` in **StripeSdk.mm** | `@stripe/stripe-react-native` **0.45.x** + **Stripe iOS ~24.12** on **Xcode 26** | Upgrade to **`@stripe/stripe-react-native` ^0.65.1** and **pod update** Stripe pods to **25.12.x** ([issue discussion](https://github.com/stripe/stripe-react-native/issues/2383)) |
| fmt / **consteval** errors with RN dependencies | fmt 11 + new Clang | Podfile **fmt** `FMT_USE_CONSTEVAL=0` and/or **patch `fmt/base.h`** as in master prompt |
| Noisy `error =non-modular-include-in-framework-module` in logs | Xcode 16/26 stricter modules | **`CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES`** on Pods targets (common RN workaround) |
| `xcodebuild` / DerivedData failures | Disk full | Free space; delete `~/Library/Developer/Xcode/DerivedData/WApp-*` |
| Wrong CLI / wrong RN version | Running from **~** or wrong cwd | Always **`cd` to repo root** before `npx react-native run-ios` |

---

## 3. Ordered checklist (human or AI)

1. **package.json** — `@stripe/stripe-react-native`: **`^0.65.1`** (do not stay on 0.45.x for Xcode 26).
2. **`npm install`** from repo root.
3. **`ios/Podfile`** — confirm New Architecture + post_install fixes (non-modular includes, fmt). Merge with any **Firebase `use_modular_headers!`** / **`use_frameworks! :linkage => :static`** already in the branch.
4. **`cd ios && bundle exec pod install`**. On version conflict with old `Podfile.lock`, run the **`pod update Stripe … stripe-react-native --repo-update`** command from the master prompt.
5. **`src/services/payment/`** — `paymentApi.js`, `contracts.js`, `index.js` (mock prefix, timeouts optional).
6. **`src/config/stripe.js`** — publishable key export.
7. **`src/redux/slices/paymentSlice.js`** + **`store.js`** registration.
8. **`src/hooks/usePayments.js`**.
9. **Screens** — `PaymentMethods.jsx`, `AddCard.jsx`; update **`Payment.jsx`**, **`CartCustomerInfo.jsx`**.
10. **`navigationStrings.js`** — `PAYMENT_METHODS`, `ADD_CARD`.
11. **`MainNavigator.jsx`** + **`src/screens/index.js`** — wire routes.
12. **`App.js`** (or root) — **conditional** `StripeProvider`.
13. **`babel.config.js`** + **`jsconfig.json`** — `@services` if used.
14. **Build** — `npx react-native run-ios` from root; fix first real compiler `error:` if any remain.

---

## 4. Reference API shapes (implement to match app usage)

**paymentApi (mock)**

- `createSetupIntent()` → `{ clientSecret: "mock_seti_...", customerId?, ephemeralKey? }`
- `createPaymentIntent({ amount, currency, paymentMethodId?, orderId?, cartId? })` → `{ clientSecret: "mock_pi_...", paymentIntentId? }`
- `listPaymentMethods()` → `{ items: SavedCard[] }`
- `deletePaymentMethod({ paymentMethodId })` → success shape you choose (boolean or empty).

**`isMockClientSecret(secret)`** — true when `secret.startsWith("mock_")`.

**usePayments (suggested surface)**

- `addCard()`, `getCards()`, `selectCard(id)`, `pay({ amount, currency, … })`, `deleteCard(id)`, optional `addDevelopmentCard()`.
- Internally: `useStripe()` → `confirmSetupIntent` / `confirmPayment` when not mock; else delayed resolve + update Redux.

**Redux payment slice (suggested fields)**

- `items: SavedCard[]`, `selectedId`, `status`, `error`, optional `lastClientSecret` / `cartId` — keep minimal unless product needs more.

---

## 5. Ruby / Bundler (only if `bundle exec pod` fails)

- If `Gemfile.lock` demands Bundler 2.7+ but system Ruby is old, either use **Homebrew Ruby 3.2+** or align **`BUNDLED WITH`** / **`RUBY VERSION`** in `Gemfile.lock` with what `ruby -v` supports, then `gem install bundler:<version>` and `bundle install`.

---

## 6. Optional: env for Stripe publishable key

- **Babel**: `babel-plugin-transform-inline-environment-variables` or `react-native-dotenv` if the project standard uses it; otherwise **`src/config/stripe.js`** can read `process.env` only if Metro defines the variable.
- Document in code comment how the team injects **`STRIPE_PUBLISHABLE_KEY`** for dev builds.

---

## 7. After reimplementation

- Commit **`package.json`**, **`package-lock.json`**, **`ios/Podfile.lock`**, and all new/changed source files.
- CI or local: clean install + iOS build on the same Xcode major version as production.

---

*Generated as a handoff so you can paste **§1** into a new chat or ticket and use **§3–§4** as an acceptance checklist.*
