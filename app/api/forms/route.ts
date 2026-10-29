import { NextResponse } from 'next/server';
import { canMail, canStore, deliver, limited } from '../../../lib/notify';

// Form submissions from the site: sign-up, demo requests, partner applications, investor pack requests, contact and subscriptions.
// Each submission is validated, then saved (Vercel Blob) and sent to the team by email (Resend), see lib/notify.ts.
// With neither switched on the route answers 503 and the page falls back to opening the visitor's email app,
// so no enquiry is lost.

export const runtime = 'nodejs';

type Field = { max: number; required?: boolean; email?: boolean; options?: string[] };
const ROLES = ['Producer or farmer', 'Cooperative or FPO', 'Processor', 'Trader', 'Buyer', 'Financier', 'Service provider', 'Government or institution', 'Partner', 'Other'];
const INVESTORS = ['Family office', 'Venture or private equity fund', 'Strategic or corporate investor', 'Sovereign or development institution', 'Qualified individual investor', 'Other'];
const COMMON: Record<string, Field> = {
  name: { max: 120, required: true }, email: { max: 160, required: true, email: true }, company: { max: 160 },
  country: { max: 80 }, phone: { max: 40 }, message: { max: 2000 }, page: { max: 200 }, cta: { max: 120 },
};
const KINDS: Record<string, { label: string; fields: Record<string, Field> }> = {
  join: { label: 'Membership sign-up', fields: { ...COMMON, company: { max: 160, required: true }, role: { max: 40, required: true, options: ROLES }, products: { max: 400 }, plan: { max: 40, options: ['Explore', 'Core', 'Growth', 'Enterprise', 'Not sure yet'] } } },
  demo: { label: 'Demo request', fields: { ...COMMON, company: { max: 160, required: true }, role: { max: 40, options: ROLES }, products: { max: 400 }, language: { max: 40 } } },
  partner: { label: 'Partner application', fields: { ...COMMON, company: { max: 160, required: true }, type: { max: 40, required: true }, licences: { max: 400 }, markets: { max: 600 } } },
  contact: { label: 'Contact', fields: { ...COMMON, topic: { max: 80 } } },
  support: { label: 'Support request', fields: { ...COMMON, reference: { max: 80 }, urgent: { max: 5 } } },
  invest: { label: 'Investor pack request', fields: { ...COMMON, company: { max: 160, required: true }, investor: { max: 60, required: true, options: INVESTORS } } },
  // A founding-offer reservation when online payment is not switched on yet: the team sends a payment link
  preonboard: { label: 'Pre-onboarding reservation (40% founding offer)', fields: { ...COMMON, company: { max: 160, required: true }, tier: { max: 20, required: true, options: ['Explore', 'Core', 'Growth'] }, billing: { max: 20, options: ['Monthly', 'Annual'] } } },
  subscribe: { label: 'T57 Insights subscription', fields: { email: COMMON.email, name: { max: 120 }, page: COMMON.page, cta: COMMON.cta } },
};

const fail = (status: number, error: string, fields?: string[]) => NextResponse.json({ ok: false, error, fields }, { status });

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return fail(400, 'bad_request'); }
  const kind = KINDS[String(body.kind)];
  if (!kind) return fail(400, 'unknown_form');
  // Bots fill the hidden field, or submit faster than a person can type
  if (body.website || (typeof body.t === 'number' && Date.now() - body.t < 2500)) return NextResponse.json({ ok: true });
  if (body.consent !== true) return fail(422, 'invalid', ['consent']);

  const data: Record<string, string> = {}, bad: string[] = [];
  for (const [k, f] of Object.entries(kind.fields)) {
    const v = typeof body[k] === 'string' ? (body[k] as string).trim() : '';
    if ((f.required && !v) || v.length > f.max || (v && f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) || (v && f.options && !f.options.includes(v))) bad.push(k);
    else if (v) data[k] = v;
  }
  if (bad.length) return fail(422, 'invalid', bad);

  if (limited(req)) return fail(429, 'too_many');
  if (!canStore() && !canMail()) return fail(503, 'not_configured');

  const record = { kind: String(body.kind), at: new Date().toISOString(), env: process.env.VERCEL_ENV || 'local', ...data };
  const done = await deliver('forms', kind.label, `${kind.label}: ${data.company || data.name || data.email}`, record, data.email);
  if (!done.length) return fail(502, 'delivery_failed');
  return NextResponse.json({ ok: true, done });
}
