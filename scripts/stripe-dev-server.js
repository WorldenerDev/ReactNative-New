/**
 * Minimal Stripe backend for local testing.
 *
 * Prereqs in project root `.env`:
 *   STRIPE_SECRET_KEY=sk_test_...
 *   STRIPE_TEST_CUSTOMER_ID=cus_...   (optional if you always pass customerId in JSON)
 *
 * Endpoints: POST /create-setup-intent, /create-payment-intent, /list-payment-methods, /detach-payment-method
 *
 * Run: `npm run stripe-server`
 * Then start Metro with the same `.env` so `STRIPE_PAYMENT_BACKEND_URL` points here
 * (use your Mac's LAN IP from a physical device, not 127.0.0.1).
 */

const http = require("http");
const path = require("path");
const { loadEnvFile } = require("./loadEnvFile");
const Stripe = require("stripe");

loadEnvFile(path.join(__dirname, "..", ".env"));

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret || !String(secret).startsWith("sk_")) {
  console.error(
    "Missing STRIPE_SECRET_KEY in .env (sk_test_... or sk_live_...). This key is only read by this Node script."
  );
  process.exit(1);
}

const stripe = new Stripe(secret);
const PORT = parseInt(process.env.STRIPE_DEV_SERVER_PORT || "4242", 10);
const defaultCustomerId = (process.env.STRIPE_TEST_CUSTOMER_ID || "").trim();

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () =>
      resolve(Buffer.concat(chunks).toString("utf8"))
    );
    req.on("error", reject);
  });
}

const ALLOWED_ROUTES = new Set([
  "/create-setup-intent",
  "/create-payment-intent",
  "/list-payment-methods",
  "/detach-payment-method",
]);

/** Node's `req.url` can include `?query`; some clients append `/`. Normalize for routing. */
function requestPathname(reqUrl) {
  const raw = reqUrl || "";
  const noQuery = raw.split("?")[0] || "/";
  if (noQuery.length > 1 && noQuery.endsWith("/")) {
    return noQuery.replace(/\/+$/, "");
  }
  return noQuery;
}

/**
 * @param {string} customerId
 * @returns {Promise<Array<{ id: string, brand: string, last4: string, isDefault: boolean }>>}
 */
async function listCustomerCardPaymentMethods(customerId) {
  let defaultPmId = null;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    const def = customer.invoice_settings?.default_payment_method;
    defaultPmId =
      typeof def === "string" ? def : def?.id != null ? String(def.id) : null;
  } catch {
    // customer fetch is optional for default flag
  }

  const items = [];
  let startingAfter;
  for (;;) {
    const page = await stripe.customers.listPaymentMethods(customerId, {
      type: "card",
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    for (const pm of page.data) {
      const c = pm.card;
      const brandRaw = c?.display_brand || c?.brand || "card";
      const brand =
        typeof brandRaw === "string"
          ? brandRaw.charAt(0).toUpperCase() +
            brandRaw.slice(1).toLowerCase()
          : "Card";
      items.push({
        id: pm.id,
        brand,
        last4: c?.last4 || "0000",
        isDefault: Boolean(defaultPmId && pm.id === defaultPmId),
      });
    }
    if (!page.has_more) {
      break;
    }
    startingAfter = page.data[page.data.length - 1]?.id;
    if (!startingAfter) {
      break;
    }
  }
  return items;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    });
    res.end();
    return;
  }

  const pathname = requestPathname(req.url);
  if (!ALLOWED_ROUTES.has(pathname)) {
    sendJson(res, 404, { error: "not_found", path: pathname });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  let json = {};
  try {
    const raw = await readBody(req);
    json = raw ? JSON.parse(raw) : {};
  } catch {
    sendJson(res, 400, { error: "invalid_json" });
    return;
  }

  try {
    if (pathname === "/create-setup-intent") {
      const customerId = String(json.customerId || defaultCustomerId || "").trim();
      if (!customerId) {
        sendJson(res, 400, {
          error: "missing_customerId",
          message:
            "Set STRIPE_TEST_CUSTOMER_ID in .env or POST { customerId } from the app.",
        });
        return;
      }
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ["card"],
      });
      sendJson(res, 200, {
        clientSecret: setupIntent.client_secret,
        customerId,
      });
      return;
    }

    if (pathname === "/create-payment-intent") {
      const customerId = String(json.customerId || defaultCustomerId || "").trim();
      const amount = json.amount;
      const currency = String(json.currency || "usd").toLowerCase();
      const paymentMethodId = String(json.paymentMethodId || "").trim();

      if (amount == null || Number(amount) < 1) {
        sendJson(res, 400, { error: "invalid_amount" });
        return;
      }
      if (!paymentMethodId) {
        sendJson(res, 400, { error: "missing_paymentMethodId" });
        return;
      }
      if (!customerId) {
        sendJson(res, 400, { error: "missing_customerId" });
        return;
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(amount),
        currency,
        customer: customerId,
        payment_method: paymentMethodId,
        payment_method_types: ["card"],
        confirm: false,
      });

      sendJson(res, 200, {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
      return;
    }

    if (pathname === "/list-payment-methods") {
      const customerId = String(json.customerId || defaultCustomerId || "").trim();
      if (!customerId) {
        sendJson(res, 400, {
          error: "missing_customerId",
          message:
            "Set STRIPE_TEST_CUSTOMER_ID in .env or POST { customerId } from the app.",
        });
        return;
      }
      const items = await listCustomerCardPaymentMethods(customerId);
      sendJson(res, 200, { items });
      return;
    }

    if (pathname === "/detach-payment-method") {
      const paymentMethodId = String(json.paymentMethodId || "").trim();
      if (!paymentMethodId.startsWith("pm_")) {
        sendJson(res, 400, { error: "invalid_paymentMethodId" });
        return;
      }
      await stripe.paymentMethods.detach(paymentMethodId);
      sendJson(res, 200, { ok: true });
      return;
    }
  } catch (e) {
    const message = e?.raw?.message || e?.message || String(e);
    sendJson(res, 500, { error: "stripe_error", message });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Stripe dev server: http://127.0.0.1:${PORT}`);
  console.log("Listening on 0.0.0.0 — use your Mac LAN IP from a physical iPhone.");
});
