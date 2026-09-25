import { loadStripe } from '@stripe/stripe-js'

// Replace with the COO's live/test publishable key at deploy time via env var.
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''

let stripePromise
export function getStripe() {
  if (!stripePromise) {
    stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : Promise.resolve(null)
  }
  return stripePromise
}

// POC stand-in for a Stripe Checkout session. In production this calls a
// serverless function / Apps Script endpoint that creates the session
// server-side and returns the redirect URL — publishable keys cannot create
// Checkout sessions directly from the browser.
export async function startCheckout({ description, amount }) {
  const stripe = await getStripe()

  if (!stripe) {
    return {
      ok: false,
      message: 'Stripe is not configured yet. Set VITE_STRIPE_PUBLISHABLE_KEY and connect a Checkout session endpoint.',
    }
  }

  return {
    ok: true,
    message: `Redirecting to Stripe Checkout for ${description} ($${amount})...`,
  }
}
