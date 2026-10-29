import { NextResponse } from 'next/server';
import { limited } from '../../../lib/notify';
import { FOUNDING_BILLING, PLANS, ensureCoupon, offer, stripe, stripeKey, type Billing, type Tier } from '../../../lib/payments';

// Pre-onboarding checkout: a founding member picks a plan and is sent to a Stripe-hosted payment page,
// with the founding discount applied (lib/payments.ts). Answers 503 while payments are not switched on,
// and the page then takes the reservation as a form instead.

export const runtime = 'nodejs';

const fail = (status: number, error: string, fields?: string[]) => NextResponse.json({ ok: false, error, fields }, { status });
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return fail(400, 'bad_request'); }
  if (body.website) return fail(400, 'bad_request');
  if (body.consent !== true) return fail(422, 'invalid', ['consent']);

  const tier = str(body.tier, 20) as Tier, billing = (str(body.billing, 20) || FOUNDING_BILLING[0]) as Billing;
  const name = str(body.name, 120), email = str(body.email, 160), company = str(body.company, 160);
  const country = str(body.country, 80), phone = str(body.phone, 40);
  const bad = [
    !PLANS[tier] && 'tier', !FOUNDING_BILLING.includes(billing) && 'billing', !name && 'name', !company && 'company',
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && 'email',
  ].filter(Boolean) as string[];
  if (bad.length) return fail(422, 'invalid', bad);
  if (limited(req)) return fail(429, 'too_many');
  if (!stripeKey()) return fail(503, 'not_configured');

  // Return to the page the visitor came from (English or Arabic), on this deployment
  const host = req.headers.get('host') || '';
  const origin = process.env.VERCEL_ENV === 'production' ? 'https://www.t57.ai' : `${/^localhost(:\d+)?$/.test(host) ? 'http' : 'https'}://${host}`;
  const back = `${origin}${body.lang === 'ar' ? '/ar' : ''}/pricing/plans`;
  const o = offer();
  const meta = { offer: `founding-${o.percent}`, plan: tier, billing, name, company, country, phone };
  try {
    const coupon = await ensureCoupon();
    const s = await stripe('checkout/sessions', {
      mode: 'subscription',
      customer_email: email,
      client_reference_id: `${tier}-${billing}`.toLowerCase(),
      line_items: { 0: { quantity: 1, price_data: {
        currency: 'usd', unit_amount: PLANS[tier][billing],
        recurring: { interval: billing === 'Annual' ? 'year' : 'month' },
        product_data: { name: `T57 ${tier} membership`, description: `${billing} membership, founding member offer` },
      } } },
      discounts: { 0: { coupon } },
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
      metadata: meta,
      subscription_data: { metadata: meta, description: `T57 ${tier} membership (founding member, ${o.percent}% off for ${o.months} months)` },
      success_url: `${back}?reserved={CHECKOUT_SESSION_ID}#founding`,
      cancel_url: `${back}?checkout=cancelled#founding`,
    });
    if (!s.ok || !s.data.url) { console.error('checkout: stripe', s.status, s.data?.error?.message); return fail(502, 'gateway_error'); }
    return NextResponse.json({ ok: true, url: s.data.url });
  } catch (e) {
    console.error('checkout', e);
    return fail(502, 'gateway_error');
  }
}
