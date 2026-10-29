import { put } from '@vercel/blob';

// Where the site keeps what visitors send: a private Vercel Blob record, and an email to the team (Resend).
// Both are switched on by environment variables:
//   BLOB_READ_WRITE_TOKEN   added by Vercel when a Blob store is connected to the project
//   RESEND_API_KEY          Resend key, for the notification email
//   FORMS_TO                where notifications go (default hello@t57.ai)
//   FORMS_FROM              sender on a domain verified in Resend (default T57 Website <forms@t57.ai>)

export const canStore = () => !!process.env.BLOB_READ_WRITE_TOKEN;
export const canMail = () => !!process.env.RESEND_API_KEY;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

// Saves the record under <folder>/<kind>/<date>/ and emails it; returns what worked ('stored', 'emailed').
export async function deliver(folder: string, label: string, subject: string, record: Record<string, string>, replyTo?: string) {
  const done: string[] = [];
  const at = record.at || new Date().toISOString();
  if (canStore()) {
    try {
      await put(`${folder}/${record.kind}/${at.slice(0, 10)}/${at.replace(/[:.]/g, '-')}.json`, JSON.stringify(record, null, 1), { access: 'private', addRandomSuffix: true, contentType: 'application/json' });
      done.push('stored');
    } catch (e) { console.error(`${folder}: blob`, e); }
  }
  if (canMail()) {
    const rows = Object.entries(record).filter(([k]) => k !== 'kind' && k !== 'at' && k !== 'env')
      .map(([k, v]) => `<tr><th align="left" style="padding:4px 12px 4px 0">${esc(k)}</th><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('');
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.FORMS_FROM || 'T57 Website <forms@t57.ai>', to: (process.env.FORMS_TO || 'hello@t57.ai').split(','),
          reply_to: replyTo, subject,
          html: `<p><b>${esc(label)}</b> from the T57 website (${esc(record.env || '')}), ${at}</p><table>${rows}</table>`,
        }),
      });
      if (r.ok) done.push('emailed'); else console.error(`${folder}: resend`, r.status, await r.text());
    } catch (e) { console.error(`${folder}: resend`, e); }
  }
  return done;
}

// Best-effort limit per instance: at most `max` requests per IP every 10 minutes
const hits = new Map<string, number[]>();
export function limited(req: Request, max = 5) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const now = Date.now(), recent = (hits.get(ip) || []).filter((t) => now - t < 600_000);
  recent.push(now); hits.set(ip, recent);
  return recent.length > max;
}
