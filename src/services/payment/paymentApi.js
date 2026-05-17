const MOCK_DELAY_MS = 450;

import {
  STRIPE_PAYMENT_BACKEND_URL,
  STRIPE_TEST_CUSTOMER_ID,
} from "@config/stripe";

/** In-memory saved cards for mock {@link listPaymentMethods} (replace with backend-backed list later). */
const mockStoredCards = [];

/** Prefixes returned by mock “client secrets” so the app can skip real Stripe confirmation. */
export const MOCK_CLIENT_SECRET_PREFIX = "mock_";

export const isMockClientSecret = (secret) =>
  typeof secret === "string" && secret.startsWith(MOCK_CLIENT_SECRET_PREFIX);

/**
 * In-memory “saved card” row for the mock list API. After a real native
 * SetupIntent confirmation, the app also appends here so `listPaymentMethods`
 * stays in sync until a backend list endpoint exists.
 *
 * @param {import('./contracts').SavedCard} card
 */
export function appendMockSavedCard(card) {
  const index = mockStoredCards.length;
  mockStoredCards.push({
    ...card,
    isDefault:
      typeof card.isDefault === "boolean"
        ? card.isDefault
        : index === 0,
  });
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const withTimeout = async (promise, ms, label) => {
  let t;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        t = setTimeout(() => reject(new Error(`${label}: timed out`)), ms);
      }),
    ]);
  } finally {
    clearTimeout(t);
  }
};

/**
 * @param {string} path
 * @param {Record<string, unknown>} body
 */
async function postPaymentBackend(path, body) {
  const base = STRIPE_PAYMENT_BACKEND_URL;
  if (!base) {
    throw new Error("STRIPE_PAYMENT_BACKEND_URL is not set");
  }
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Payment backend ${res.status}: ${text || "(empty)"}`);
  }
  if (!res.ok) {
    const msg = json?.message || json?.error || text || res.status;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return json;
}

function defaultCustomerId(request) {
  const fromRequest =
    request && typeof request.customerId === "string"
      ? request.customerId.trim()
      : "";
  if (fromRequest) {
    return fromRequest;
  }
  return STRIPE_TEST_CUSTOMER_ID ? String(STRIPE_TEST_CUSTOMER_ID).trim() : "";
}

/** True when the app should call the dev/proxy server for payment APIs (see `scripts/stripe-dev-server.js`). */
export function isPaymentBackendConfigured() {
  return Boolean(String(STRIPE_PAYMENT_BACKEND_URL || "").trim());
}

/**
 * When `STRIPE_PAYMENT_BACKEND_URL` is set, calls the dev/proxy server (see `scripts/stripe-dev-server.js`).
 * Otherwise returns mock client secrets.
 *
 * @param {import('./contracts').CreateSetupIntentRequest} [request]
 * @returns {Promise<import('./contracts').CreateSetupIntentResponse>}
 */
export async function createSetupIntent(request = {}) {
  if (STRIPE_PAYMENT_BACKEND_URL) {
    const customerId = defaultCustomerId(request);
    if (!customerId) {
      await delay(MOCK_DELAY_MS);
      return {
        clientSecret: `${MOCK_CLIENT_SECRET_PREFIX}seti_1_no_customer_id`,
        customerId: undefined,
        ephemeralKey: undefined,
      };
    }
    try {
      return await postPaymentBackend("/create-setup-intent", { customerId });
    } catch {
      await delay(MOCK_DELAY_MS);
      return {
        clientSecret: `${MOCK_CLIENT_SECRET_PREFIX}seti_1_fallback_after_backend_error`,
        customerId: undefined,
        ephemeralKey: undefined,
      };
    }
  }
  await delay(MOCK_DELAY_MS);
  return {
    clientSecret: `${MOCK_CLIENT_SECRET_PREFIX}seti_1_replace_with_backend_secret`,
    customerId: undefined,
    ephemeralKey: undefined,
  };
}

/**
 * @param {import('./contracts').CreatePaymentIntentRequest} [request]
 * @returns {Promise<import('./contracts').CreatePaymentIntentResponse>}
 */
export async function createPaymentIntent(request = {}) {
  if (STRIPE_PAYMENT_BACKEND_URL) {
    const customerId = defaultCustomerId(request);
    const {
      amount,
      currency = "usd",
      paymentMethodId,
      cartId,
      orderId,
    } = request || {};
    return postPaymentBackend("/create-payment-intent", {
      amount,
      currency,
      paymentMethodId,
      cartId,
      orderId,
      customerId,
    });
  }
  await delay(MOCK_DELAY_MS);
  return {
    clientSecret: `${MOCK_CLIENT_SECRET_PREFIX}pi_1_replace_with_backend_secret`,
    paymentIntentId: `${MOCK_CLIENT_SECRET_PREFIX}pi_id`,
  };
}

/**
 * Merges Stripe-listed PMs with any in-memory-only mock rows (deduped by id).
 *
 * @param {unknown[]} remoteItems
 */
function mergePaymentMethodItems(remoteItems) {
  const fromRemote = Array.isArray(remoteItems) ? remoteItems : [];
  const seen = new Set(fromRemote.map((i) => i?.id).filter(Boolean));
  const merged = fromRemote.map((i) => ({ ...i }));
  for (const m of mockStoredCards) {
    if (m?.id && !seen.has(m.id)) {
      merged.push({ ...m });
      seen.add(m.id);
    }
  }
  return merged;
}

/**
 * Lists saved cards: Stripe customer payment methods when `STRIPE_PAYMENT_BACKEND_URL`
 * is set (merged with in-memory mock rows); otherwise the in-memory mock store.
 *
 * @param {{ customerId?: string }} [request]
 * @returns {Promise<import('./contracts').ListPaymentMethodsResponse>}
 */
export async function listPaymentMethods(request = {}) {
  if (STRIPE_PAYMENT_BACKEND_URL) {
    const customerId = defaultCustomerId(request);
    if (!customerId) {
      await delay(MOCK_DELAY_MS);
      return { items: mockStoredCards.map((c) => ({ ...c })) };
    }
    const json = await postPaymentBackend("/list-payment-methods", {
      customerId,
    });
    return { items: mergePaymentMethodItems(json.items) };
  }
  await delay(MOCK_DELAY_MS);
  return {
    items: mockStoredCards.map((c) => ({ ...c })),
  };
}

/**
 * @param {import('./contracts').DeletePaymentMethodRequest} _request
 */
export async function deletePaymentMethod(_request) {
  if (STRIPE_PAYMENT_BACKEND_URL) {
    const paymentMethodId = String(_request?.paymentMethodId || "").trim();
    if (!paymentMethodId) {
      throw new Error("Missing paymentMethodId");
    }
    await postPaymentBackend("/detach-payment-method", { paymentMethodId });
    const idx = mockStoredCards.findIndex((c) => c.id === paymentMethodId);
    if (idx >= 0) {
      mockStoredCards.splice(idx, 1);
    }
    return { ok: true };
  }
  await delay(MOCK_DELAY_MS);
  const { paymentMethodId } = _request || {};
  const idx = mockStoredCards.findIndex((c) => c.id === paymentMethodId);
  if (idx >= 0) {
    mockStoredCards.splice(idx, 1);
  }
  return { ok: true };
}

/**
 * Wraps API calls with a ceiling duration so UI can recover.
 *
 * @template T
 * @param {() => Promise<T>} fn
 * @param {number} [timeoutMs=20000]
 */
export async function runPaymentApi(fn, timeoutMs = 20000) {
  return withTimeout(fn(), timeoutMs, "Payment API");
}
