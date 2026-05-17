/**
 * Stripe publishable key for `@stripe/stripe-react-native`.
 *
 * Values come from the project root `.env` via `babel-plugin-inline-dotenv`
 * (see `babel.config.js`). Metro also loads `.env` in `metro.config.js` for tooling.
 */
export const STRIPE_PUBLISHABLE_KEY = String(
  process.env.STRIPE_PUBLISHABLE_KEY || ""
).trim();

/** Test Customer id (`cus_...`) for SetupIntent / PaymentIntent when using the dev backend. */
export const STRIPE_TEST_CUSTOMER_ID = String(
  process.env.STRIPE_TEST_CUSTOMER_ID || ""
).trim();

/**
 * Optional dev-only URL for `scripts/stripe-dev-server.js` (e.g. `http://192.168.1.10:4242` on a physical device).
 * When set, payment API modules call this instead of returning mock client secrets.
 */
export const STRIPE_PAYMENT_BACKEND_URL = String(
  process.env.STRIPE_PAYMENT_BACKEND_URL || ""
)
  .trim()
  .replace(/\/$/, "");
