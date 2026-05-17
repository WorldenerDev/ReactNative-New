/**
 * Request/response contracts for payment APIs (JSDoc for IDE hints; no runtime types).
 *
 * TODO: Align field names with the real backend when endpoints exist.
 */

/**
 * @typedef {Object} SavedCard
 * @property {string} id Payment method id from Stripe (e.g. pm_...) or mock id.
 * @property {string} brand e.g. Visa, Mastercard
 * @property {string} last4
 * @property {boolean} [isDefault]
 */

/**
 * @typedef {Object} CreateSetupIntentRequest
 * @property {string} [customerId] Stripe Customer id from your backend, when available.
 */

/**
 * @typedef {Object} CreateSetupIntentResponse
 * @property {string} clientSecret SetupIntent client secret from Stripe (via backend).
 * @property {string} [customerId]
 * @property {string} [ephemeralKey] For Payment Sheet customer-scoped saved cards.
 */

/**
 * @typedef {Object} CreatePaymentIntentRequest
 * @property {number} amount Minor units (e.g. cents).
 * @property {string} currency ISO code, e.g. "usd".
 * @property {string} [paymentMethodId] Saved card id (pm_...).
 * @property {string} [orderId] Your order / booking id when backend assigns it.
 * @property {string} [cartId]
 */

/**
 * @typedef {Object} CreatePaymentIntentResponse
 * @property {string} clientSecret PaymentIntent client secret.
 * @property {string} [paymentIntentId]
 */

/**
 * @typedef {Object} ListPaymentMethodsResponse
 * @property {SavedCard[]} items
 */

/**
 * @typedef {Object} DeletePaymentMethodRequest
 * @property {string} paymentMethodId
 */

export const PaymentContracts = {};
