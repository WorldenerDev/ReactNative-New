/**
 * Backend base URL for REST API and Socket.IO.
 *
 * Values come from the project root `.env` via `babel-plugin-inline-dotenv`
 * (see `babel.config.js`). Metro also loads `.env` in `metro.config.js` for tooling.
 */
const normalizeBaseUrl = (url) => String(url || "").trim().replace(/\/$/, "");

const API_ENV = String(process.env.API_ENV || "production")
  .trim()
  .toLowerCase();

export const API_BASE_URL_PRODUCTION = normalizeBaseUrl(
  process.env.API_BASE_URL_PRODUCTION || "https://api.worldener.com"
);

export const API_BASE_URL_UAT = normalizeBaseUrl(
  process.env.API_BASE_URL_UAT || "https://uat-api.worldener.com"
);

/** Active base URL (no trailing slash). Controlled by `API_ENV` in `.env`. */
export const URL =
  API_ENV === "uat" ? API_BASE_URL_UAT : API_BASE_URL_PRODUCTION;
