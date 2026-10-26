import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// Form submissions from the site: sign-up, demo requests, partner applications, contact and subscriptions.
// Each submission is validated, then saved (Vercel Blob) and sent to the team by email (Resend).
// Both are switched on by environment variables; with neither set the route answers 503 and the
// page falls back to opening the visitor's email app, so no enquiry is lost.
//   BLOB_READ_WRITE_TOKEN   added by Vercel when a Blob store is connected to the project
//   RESEND_API_KEY          Resend key, for the notification email
//   FORMS_TO                where notifications go (default hello@t57.ai)
//   FORMS_FROM              sender on a domain verified in Resend (default T57 Website <forms@t57.ai>)

export const runtime = 'nodejs';

type Field = { max: number; required?: boolean; email?: boolean; options?: string[] };
const ROLES = ['Producer or farmer', 'Cooperative or FPO', 'Processor', 'Trader', 'Buyer', 'Financier', 'Service provider', 'Government or institution', 'Partner', 'Other'];
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
  subscribe: { label: 'T57 Insights subscription', fields: { email: COMMON.email, name: { max: 120 }, page: COMMON.page, cta: COMMON.cta } },
};

// Best-effort limit per instance: at most 5 submissions per IP every 10 minutes
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now(), recent = (hits.get(ip) || []).filter((t) => now - t < 600_000);
  recent.push(now); hits.set(ip, recent);
  return recent.length > 5;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
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

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return fail(429, 'too_many');

  const store = !!process.env.BLOB_READ_WRITE_TOKEN, mail = !!process.env.RESEND_API_KEY;
  if (!store && !mail) return fail(503, 'not_configured');

  const at = new Date().toISOString();
  const record = { kind: String(body.kind), at, env: process.env.VERCEL_ENV || 'local', ...data };
  const done: string[] = [];
  if (store) {
    try {
      await put(`forms/${record.kind}/${at.slice(0, 10)}/${at.replace(/[:.]/g, '-')}.json`, JSON.stringify(record, null, 1), { access: 'private', addRandomSuffix: true, contentType: 'application/json' });
      done.push('stored');
    } catch (e) { console.error('forms: blob', e); }
  }
  if (mail) {
    const rows = Object.entries(data).map(([k, v]) => `<tr><th align="left" style="padding:4px 12px 4px 0">${esc(k)}</th><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('');
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.FORMS_FROM || 'T57 Website <forms@t57.ai>', to: (process.env.FORMS_TO || 'hello@t57.ai').split(','),
          reply_to: data.email, subject: `${kind.label}: ${data.company || data.name || data.email}`,
          html: `<p><b>${esc(kind.label)}</b> from the T57 website (${esc(record.env)}), ${at}</p><table>${rows}</table>`,
        }),
      });
      if (r.ok) done.push('emailed'); else console.error('forms: resend', r.status, await r.text());
    } catch (e) { console.error('forms: resend', e); }
  }
  if (!done.length) return fail(502, 'delivery_failed');
  return NextResponse.json({ ok: true, done });
}
