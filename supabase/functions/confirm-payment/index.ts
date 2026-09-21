import { createClient } from 'npm:@supabase/supabase-js@2';

const ORIGINS = new Set([
  'https://dennisnazar-bookstore.com',
  'https://www.dennisnazar-bookstore.com',
  'https://dennisnazarbookstore.netlify.app',
  'https://kstore.netlify.app',
  'https://4175-icl28leqimffgt4d34yzq-e6f1c394.us4.manus.computer',
  'http://localhost:4175',
  'http://127.0.0.1:4175'
]);

function cors(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
  if (origin && ORIGINS.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}


const NAVY = '#211d5a';
const ORANGE = '#f47721';
const MUTED = '#686772';
const SOFT = '#f6f5f8';
const LINE = '#e4e3e7';

function esc(value: unknown) {
  return String(value ?? '').replace(/[&<>"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  }[char] || char));
}

function brandedPaymentEmail(input: { customerName: string; orderNumber: string; titles: string; libraryUrl: string; siteUrl: string }) {
  const home = input.siteUrl.replace(/\/$/, '');
  const logo = `${home}/assets/dn-logo-white.png`;
  const name = esc(input.customerName || 'there');
  const order = esc(input.orderNumber);
  const titles = esc(input.titles);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Dennis Nazar — Payment Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#ececf0;font-family:Arial,Helvetica,sans-serif;color:#242238;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Payment confirmed — your Dennis Nazar Private Library is ready.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ececf0;">
<tr><td align="center" style="padding:28px 10px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:#ffffff;">
<tr><td align="center" style="background:${NAVY};padding:30px 24px 28px;">
<a href="${home}" style="display:inline-block;text-decoration:none;">
<img src="${logo}" width="190" alt="Dennis Nazar" style="display:block;width:190px;max-width:82%;height:auto;border:0;">
</a>
<div style="margin-top:13px;font-size:10px;line-height:1.4;letter-spacing:3px;font-weight:800;color:#fff;text-transform:uppercase;">DENNIS NAZAR · OFFICIAL BOOKS STORE</div>
</td></tr>
<tr><td style="padding:36px 40px 30px;background:#fff;">
<div style="font-size:10px;line-height:1.5;letter-spacing:2px;font-weight:800;color:${ORANGE};text-transform:uppercase;margin-bottom:12px;">PAYMENT CONFIRMED</div>
<h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.18;color:${NAVY};font-weight:700;">Your order is confirmed.</h1>
<p style="margin:0 0 13px;font-size:15px;line-height:1.7;color:#4f4e59;">Hello ${name},</p>
<p style="margin:0 0 24px;font-size:14px;line-height:1.8;color:${MUTED};">Your payment has been verified successfully. Your purchased books are now connected to your private Dennis Nazar Library.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;background:${SOFT};border-left:3px solid ${ORANGE};">
<tr><td style="padding:15px 16px;">
<div style="font-size:9px;line-height:1.5;letter-spacing:1.5px;font-weight:800;color:${ORANGE};text-transform:uppercase;margin-bottom:5px;">ORDER</div>
<div style="font-size:13px;line-height:1.5;font-weight:700;color:${NAVY};">${order}</div>
<div style="font-size:11px;line-height:1.6;color:#777680;margin-top:3px;">Books: <strong style="color:${NAVY};">${titles}</strong></div>
</td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
<tr><td style="background:${ORANGE};border-radius:4px;">
<a href="${esc(input.libraryUrl)}" style="display:inline-block;padding:14px 24px;font-size:13px;line-height:1;font-weight:800;letter-spacing:.2px;color:#fff;text-decoration:none;">OPEN MY LIBRARY</a>
</td></tr></table>
<p style="margin:0 0 10px;font-size:12px;line-height:1.7;color:#777680;">Sign in with the same email address used during checkout.</p>
<p style="margin:0;font-size:12px;line-height:1.7;color:#777680;">Keep this email for your order reference: <strong style="color:${NAVY};">${order}</strong></p>
<div style="height:1px;background:${LINE};margin:27px 0 19px;"></div>
<p style="margin:0;font-size:11px;line-height:1.6;color:#8a8992;">Need help? <a href="mailto:dennisnazar123@gmail.com" style="color:${NAVY};">dennisnazar123@gmail.com</a></p>
</td></tr>
<tr><td style="background:${NAVY};padding:21px 28px;text-align:center;">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;color:#fff;margin-bottom:5px;">Dennis Nazar</div>
<div style="font-size:9px;line-height:1.6;letter-spacing:1.5px;color:#c9c7d7;text-transform:uppercase;">Author · Teacher · Mentor</div>
<div style="height:1px;background:rgba(255,255,255,.15);margin:15px auto;width:70%;"></div>
<div style="font-size:10px;line-height:1.6;color:#aaa8ba;">Official Dennis Nazar Books Store · Private Library</div>
<div style="font-size:10px;line-height:1.6;margin-top:7px;"><a href="${home}" style="color:#fff;text-decoration:underline;">dennisnazar-bookstore.com</a></div>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

function json(data: unknown, status = 200, req?: Request) {
  return new Response(JSON.stringify(data), { status, headers: { ...(req ? cors(req) : {}), 'Content-Type': 'application/json' } });
}

function db() {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SECRET_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function assertAdmin(req: Request) {
  const auth = req.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) throw new Error('Missing authorization.');
  const admin = db();
  const user = await admin.auth.getUser(auth.slice(7));
  if (user.error || !user.data.user) throw new Error('Not authenticated.');
  const row = await admin.from('admin_users').select('user_id,role').eq('user_id', user.data.user.id).maybeSingle();
  if (row.error || !row.data || row.data.role !== 'admin') throw new Error('Admin access required.');
  return { admin, user: user.data.user };
}

async function sendEmail(to: string, subject: string, html: string) {
  const key = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM');
  if (!key || !from) return { configured: false, ok: false };
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [to], subject, html }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Resend: ${data?.message || response.statusText}`);
  return { configured: true, ok: true, id: data?.id || null };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(req) });
  if (req.headers.get('Origin') && !cors(req)['Access-Control-Allow-Origin']) return json({ error: 'Origin not allowed.' }, 403, req);
  try {
    const { admin, user } = await assertAdmin(req);
    const body = await req.json();
    const orderId = String(body.orderId || '');
    if (!orderId) throw new Error('orderId is required.');
    const orderResult = await admin.from('orders').select('*').eq('id', orderId).single();
    if (orderResult.error || !orderResult.data) throw new Error('Order not found.');
    const order = orderResult.data;
    if (order.status !== 'PENDING_VERIFICATION') throw new Error(`Order is already ${order.status}.`);
    const itemResult = await admin.from('order_items').select('title_snapshot').eq('order_id', orderId);
    if (itemResult.error || !itemResult.data?.length) throw new Error('Order has no books.');
    const titles = itemResult.data.map((item: any) => item.title_snapshot).join(', ');
    const libraryUrl = `${Deno.env.get('PUBLIC_SITE_URL') || 'https://dennisnazar-bookstore.com'}/library.html`;
    const eventKey = `payment-confirmed:${order.id}`;
    const now = new Date().toISOString();

    // Claim the pending order before calling external providers. A second concurrent request cannot send a duplicate notification.
    const claim = await admin.from('orders').update({ status: 'CONFIRMED', confirmed_at: now, confirmed_by: user.id, approved_at: now, approved_by: user.id }).eq('id', order.id).eq('status', 'PENDING_VERIFICATION').select('id,status').maybeSingle();
    if (claim.error) throw claim.error;
    if (!claim.data) throw new Error('Order is already being confirmed or is no longer pending.');

    const html = brandedPaymentEmail({ customerName: order.customer_name, orderNumber: order.order_number, titles, libraryUrl, siteUrl: Deno.env.get('PUBLIC_SITE_URL') || 'https://dennisnazar-bookstore.com' });
    let email: any = { configured: false, ok: false };
    const errors: string[] = [];
    try { email = await sendEmail(order.customer_email, `Order ${order.order_number} confirmed — Dennis Nazar`, html); } catch (error) { errors.push(error instanceof Error ? error.message : 'Email delivery failed'); }
    await admin.from('delivery_logs').upsert([
      { order_id: order.id, channel: 'email', event_key: eventKey, status: email.ok ? 'sent' : email.configured ? 'failed' : 'not_configured', provider_message_id: email.id || null, error_message: email.ok || !email.configured ? null : errors.join('; ') }
    ], { onConflict: 'order_id,channel,event_key', ignoreDuplicates: true });
    return json({ ok: true, status: 'CONFIRMED', email, errors, libraryUrl, orderNumber: order.order_number }, 200, req);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unable to confirm order.' }, 400, req);
  }
});
