import { createContext, useContext } from "react";

/**
 * Holds `useStripe()` result when {@link STRIPE_PUBLISHABLE_KEY} is set and StripeProvider is mounted; otherwise null.
 * Lets payment hooks avoid calling `useStripe` when there is no StripeProvider.
 */
export const PaymentStripeContext = createContext(null);

export function usePaymentStripe() {
  return useContext(PaymentStripeContext);
}
