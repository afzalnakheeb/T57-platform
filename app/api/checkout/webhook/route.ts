import { NextResponse } from 'next/server';
import { deliver } from '../../../../lib/notify';
import { verifySignature } from '../../../../lib/payments';

// Stripe calls this when a founding member's payment goes through (checkout.session.completed).
// Each paid reservation is saved to the private Blob store under payments/ and emailed to the team.
// Add the endpoint in Stripe (Developers > Webhooks) and put its signing secret in STRIPE_WEBHOOK_SECRET.

export const runtime = 'nodejs';

const money = (cents: number, cur: string) => `${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${cur.toUpperCase()}`;

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET || '')) {
    return NextResponse.json({ ok: false, error: 'bad_signature' }, { status: 400 });
  }
  const event = JSON.parse(raw);
  if (event.type !== 'checkout.session.completed') return NextResponse.json({ ok: true, ignored: event.type });

  const s = event.data.object, m = s.metadata || {};
  const record: Record<string, string> = {
    kind: 'preonboard', at: new Date((event.created || Date.now() / 1000) * 1000).toISOString(),
    env: s.livemode ? 'live' : 'test', status: s.payment_status,
    plan: `${m.plan} (${m.billing})`, paid: money(s.amount_total || 0, s.currency || 'usd'), list_price: money(s.amount_subtotal || 0, s.currency || 'usd'),
    name: m.name || s.customer_details?.name || '', email: s.customer_details?.email || s.customer_email || '',
    company: m.company || '', country: m.country || s.customer_details?.address?.country || '', phone: m.phone || '',
    offer: m.offer || '', session: s.id, subscription: s.subscription || '', customer: s.customer || '',
  };
  const done = await deliver('payments', 'Founding member payment', `Founding member payment: ${record.company || record.name} – ${record.plan}, ${record.paid}${s.livemode ? '' : ' [TEST]'}`, record, record.email);
  // Stripe retries anything that is not 2xx, so only ask for a retry when nothing was recorded
  if (!done.length && (process.env.BLOB_READ_WRITE_TOKEN || process.env.RESEND_API_KEY)) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true, done });
}
