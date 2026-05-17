import { PaymentStripeContext } from "@context/PaymentStripeContext";
import { STRIPE_PUBLISHABLE_KEY } from "@config/stripe";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";

function StripeKeyedSubtree({ children }) {
  const stripe = useStripe();
  return (
    <PaymentStripeContext.Provider value={stripe}>
      {children}
    </PaymentStripeContext.Provider>
  );
}

/**
 * Mounts {@link StripeProvider} only when a publishable key is configured; otherwise exposes a null Stripe context so the app still boots.
 */
export default function StripeAppBridge({ children }) {
  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <PaymentStripeContext.Provider value={null}>
        {children}
      </PaymentStripeContext.Provider>
    );
  }
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <StripeKeyedSubtree>{children}</StripeKeyedSubtree>
    </StripeProvider>
  );
}
