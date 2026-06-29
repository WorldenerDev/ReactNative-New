/**
 * Stripe publishable key for `@stripe/stripe-react-native`.
 *
 * Values come from the project root `.env` via `babel-plugin-inline-dotenv`
 * (see `babel.config.js`). Metro also loads `.env` in `metro.config.js` for tooling.
 *
 * Active key follows `API_ENV`: production → live key, uat → test key.
 */
const API_ENV = String(process.env.API_ENV || "production")
  .trim()
  .toLowerCase();

const isPublishableStripeKey = (key) =>
  key.startsWith("pk_test_") || key.startsWith("pk_live_");

const normalizeKey = (key) => {
  const trimmed = String(key || "").trim();
  return isPublishableStripeKey(trimmed) ? trimmed : "";
};

const STRIPE_PUBLISHABLE_KEY_PRODUCTION = normalizeKey(
  process.env.STRIPE_PUBLISHABLE_KEY_PRODUCTION
);

const STRIPE_PUBLISHABLE_KEY_UAT = normalizeKey(
  process.env.STRIPE_PUBLISHABLE_KEY_UAT
);

export const STRIPE_PUBLISHABLE_KEY =
  API_ENV === "uat"
    ? STRIPE_PUBLISHABLE_KEY_UAT
    : STRIPE_PUBLISHABLE_KEY_PRODUCTION;

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
