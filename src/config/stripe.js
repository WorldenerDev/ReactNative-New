/**
 * Stripe publishable key for `@stripe/stripe-react-native`.
 *
 * Values come from `src/config/env.generated.js`, written from `.env`
 * before Metro starts and before the Android Gradle build.
 *
 * Active key follows `API_ENV`: production → live key, uat → test key.
 */
import {
  API_ENV as API_ENV_RAW,
  STRIPE_PAYMENT_BACKEND_URL as STRIPE_PAYMENT_BACKEND_URL_RAW,
  STRIPE_PUBLISHABLE_KEY_PRODUCTION as STRIPE_PUBLISHABLE_KEY_PRODUCTION_RAW,
  STRIPE_PUBLISHABLE_KEY_UAT as STRIPE_PUBLISHABLE_KEY_UAT_RAW,
  STRIPE_TEST_CUSTOMER_ID as STRIPE_TEST_CUSTOMER_ID_RAW,
} from "./env.generated";

const API_ENV = String(API_ENV_RAW || "production")
  .trim()
  .toLowerCase();

const isPublishableStripeKey = (key) =>
  key.startsWith("pk_test_") || key.startsWith("pk_live_");

const normalizeKey = (key) => {
  const trimmed = String(key || "").trim();
  return isPublishableStripeKey(trimmed) ? trimmed : "";
};

const STRIPE_PUBLISHABLE_KEY_PRODUCTION = normalizeKey(
  STRIPE_PUBLISHABLE_KEY_PRODUCTION_RAW
);

const STRIPE_PUBLISHABLE_KEY_UAT = normalizeKey(STRIPE_PUBLISHABLE_KEY_UAT_RAW);

export const STRIPE_PUBLISHABLE_KEY =
  API_ENV === "uat"
    ? STRIPE_PUBLISHABLE_KEY_UAT
    : STRIPE_PUBLISHABLE_KEY_PRODUCTION;

/** Test Customer id (`cus_...`) for SetupIntent / PaymentIntent when using the dev backend. */
export const STRIPE_TEST_CUSTOMER_ID = String(
  STRIPE_TEST_CUSTOMER_ID_RAW || ""
).trim();

/**
 * Optional dev-only URL for `scripts/stripe-dev-server.js` (e.g. `http://192.168.1.10:4242` on a physical device).
 * When set, payment API modules call this instead of returning mock client secrets.
 */
export const STRIPE_PAYMENT_BACKEND_URL = String(
  STRIPE_PAYMENT_BACKEND_URL_RAW || ""
)
  .trim()
  .replace(/\/$/, "");
