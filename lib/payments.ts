import crypto from 'node:crypto';

// Online membership payments for the pre-onboarding (founding member) offer, through Stripe Checkout.
// Stripe hosts the card page, so card details never touch this site. Switched on by environment variables:
//   STRIPE_SECRET_KEY        sk_test_... on Preview; sk_live_... only once live payments are approved
//   STRIPE_WEBHOOK_SECRET    whsec_... for the endpoint /api/checkout/webhook (records each paid reservation)
//   PAYMENTS_LIVE            must be "true" before a live key is used, so real money is never taken by accident
//   PREONBOARD_PERCENT       founding discount, default 40
//   PREONBOARD_MONTHS        how many months the discount lasts, default 12 (an annual plan's first year)
// With no usable key the checkout answers 503 and the page takes the reservation as a form instead.

// Standard list prices in US cents (Pricing > Plans). Annual is two months free. Enterprise is quoted, not sold online.
export const PLANS = {
  Explore: { Monthly: 19900, Annual: 199000 },
  Core: { Monthly: 49900, Annual: 499000 },
  Growth: { Monthly: 74900, Annual: 749000 },
} as const;
export type Tier = keyof typeof PLANS;
export type Billing = 'Monthly' | 'Annual';
// The founding offer is a one-year commitment, paid upfront (Afzal, 29 Oct 2026)
export const FOUNDING_BILLING: Billing[] = ['Annual'];

export const offer = () => {
  const percent = Math.min(90, Math.max(1, Number(process.env.PREONBOARD_PERCENT) || 40));
  const months = Math.min(36, Math.max(1, Number(process.env.PREONBOARD_MONTHS) || 12));
  return { percent, months, coupon: `T57-FOUNDING-${percent}-${months}M` };
};

export function stripeKey() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (key.startsWith('sk_test_') || key.startsWith('rk_test_')) return key;
  if ((key.startsWith('sk_live_') || key.startsWith('rk_live_')) && process.env.PAYMENTS_LIVE === 'true') return key;
  return '';
}

// Stripe's API takes form-encoded bodies with bracketed keys: line_items[0][price_data][currency]=usd
function form(o: Record<string, unknown>, pre = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === null || v === '') continue;
    const key = pre ? `${pre}[${k}]` : k;
    if (typeof v === 'object') form(v as Record<string, unknown>, key, out);
    else out.append(key, String(v));
  }
  return out;
}

export async function stripe(path: string, body?: Record<string, unknown>, idempotency?: string) {
  const headers: Record<string, string> = { Authorization: `Bearer ${stripeKey()}`, 'Stripe-Version': '2024-06-20' };
  if (body) headers['Content-Type'] = 'application/x-www-form-urlencoded';
  if (idempotency) headers['Idempotency-Key'] = idempotency;
  const r = await fetch(`https://api.stripe.com/v1/${path}`, { method: body ? 'POST' : 'GET', headers, body: body ? form(body) : undefined });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data: j as Record<string, any> };
}

// The founding coupon is created once in the Stripe account, the first time anyone checks out
export async function ensureCoupon() {
  const o = offer();
  const got = await stripe(`coupons/${o.coupon}`);
  if (got.ok) return o.coupon;
  const made = await stripe('coupons', { id: o.coupon, name: `Founding member ${o.percent}% off`, percent_off: o.percent, duration: 'repeating', duration_in_months: o.months });
  if (made.ok || made.data?.error?.code === 'resource_already_exists') return o.coupon;
  throw new Error(`coupon: ${made.status} ${made.data?.error?.message}`);
}

// Checks the Stripe-Signature header: t=<unix time>,v1=<HMAC-SHA256 of "t.body">, within five minutes
export function verifySignature(raw: string, header: string | null, secret: string) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]).filter((p) => p[0] === 't'));
  const t = Number(parts.t), sigs = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return false;
  const want = Buffer.from(crypto.createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex'));
  return sigs.some((s) => s.length === want.length && crypto.timingSafeEqual(Buffer.from(s), want));
}
