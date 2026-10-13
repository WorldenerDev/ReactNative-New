/**
 * Writes `src/config/env.generated.js` from the project `.env`.
 *
 * Android debug builds do not embed JS; they load it from Metro. Android release
 * bundling only re-runs when JS inputs change. `.env` is neither, so API_ENV
 * edits were left on the previous production bundle. This file is real source,
 * so both Metro and Gradle pick up the selected environment.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");
const outPath = path.join(root, "src/config/env.generated.js");

function parseEnv(text) {
  const out = {};
  for (const rawLine of String(text).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const eq = line.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) {
      out[key] = val;
    }
  }
  return out;
}

function jsString(value) {
  return JSON.stringify(value == null ? "" : String(value));
}

function writeEnvConfig() {
  const env = fs.existsSync(envPath)
    ? parseEnv(fs.readFileSync(envPath, "utf8"))
    : {};
  const apiEnv = String(env.API_ENV || "production").trim().toLowerCase();
  const contents = `/* Generated from .env by scripts/writeEnvConfig.js. Do not edit. */
export const API_ENV = ${jsString(apiEnv)};
export const API_BASE_URL_PRODUCTION = ${jsString(
    env.API_BASE_URL_PRODUCTION || "https://api.worldener.com"
  )};
export const API_BASE_URL_UAT = ${jsString(
    env.API_BASE_URL_UAT || "https://uat-api.worldener.com"
  )};
export const STRIPE_PUBLISHABLE_KEY_PRODUCTION = ${jsString(
    env.STRIPE_PUBLISHABLE_KEY_PRODUCTION || ""
  )};
export const STRIPE_PUBLISHABLE_KEY_UAT = ${jsString(
    env.STRIPE_PUBLISHABLE_KEY_UAT || ""
  )};
export const STRIPE_TEST_CUSTOMER_ID = ${jsString(
    env.STRIPE_TEST_CUSTOMER_ID || ""
  )};
export const STRIPE_PAYMENT_BACKEND_URL = ${jsString(
    env.STRIPE_PAYMENT_BACKEND_URL || ""
  )};
`;

  const previous = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8") : "";
  if (previous !== contents) {
    fs.writeFileSync(outPath, contents);
  }
  return apiEnv;
}

if (require.main === module) {
  const apiEnv = writeEnvConfig();
  console.log(`Android/Metro env: API_ENV=${apiEnv}`);
}

module.exports = { writeEnvConfig };
