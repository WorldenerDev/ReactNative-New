/**
 * Backend base URL for REST API and Socket.IO.
 *
 * `src/config/env.generated.js` is written from the project root `.env`
 * before Metro starts and before the Android Gradle build.
 */
import {
  API_BASE_URL_PRODUCTION as API_BASE_URL_PRODUCTION_RAW,
  API_BASE_URL_UAT as API_BASE_URL_UAT_RAW,
  API_ENV as API_ENV_RAW,
} from "./env.generated";

const normalizeBaseUrl = (url) => String(url || "").trim().replace(/\/$/, "");

const API_ENV = String(API_ENV_RAW || "production")
  .trim()
  .toLowerCase();

export const API_BASE_URL_PRODUCTION = normalizeBaseUrl(
  API_BASE_URL_PRODUCTION_RAW || "https://api.worldener.com"
);

export const API_BASE_URL_UAT = normalizeBaseUrl(
  API_BASE_URL_UAT_RAW || "https://uat-api.worldener.com"
);

/** Active base URL (no trailing slash). Controlled by `API_ENV` in `.env`. */
export const URL =
  API_ENV === "uat" ? API_BASE_URL_UAT : API_BASE_URL_PRODUCTION;

if (__DEV__) {
  console.log(`[env] API_ENV=${API_ENV} URL=${URL}`);
}
