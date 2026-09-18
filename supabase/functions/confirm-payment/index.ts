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

function esc(value: string) {
  return String(value).replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char] || char));
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

async function sendWhatsApp(to: string, body: string) {
  const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
  const phone = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  const version = Deno.env.get('WHATSAPP_API_VERSION') || 'v23.0';
  if (!token || !phone) return { configured: false, ok: false };
  const response = await fetch(`https://graph.facebook.com/${version}/${phone}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to: to.replace(/\D/g, ''), type: 'text', text: { preview_url: true, body } }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`WhatsApp: ${data?.error?.message || response.statusText}`);
  return { configured: true, ok: true, id: data?.messages?.[0]?.id || null };
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

    const html = `<div><h2>Your Dennis Nazar order is confirmed</h2><p>Hello ${esc(order.customer_name)},</p><p>Your payment for order <strong>${esc(order.order_number)}</strong> has been confirmed.</p><p>Your books: ${esc(titles)}</p><p><a href='${libraryUrl}'>Open My Library</a></p></div>`;
    const text = `Payment confirmed. Order ${order.order_number}. Books: ${titles}. Open your private library: ${libraryUrl}.`;
    let email: any = { configured: false, ok: false };
    let whatsapp: any = { configured: false, ok: false };
    const errors: string[] = [];
    try { email = await sendEmail(order.customer_email, `Order ${order.order_number} confirmed — Dennis Nazar`, html); } catch (error) { errors.push(error instanceof Error ? error.message : 'Email delivery failed'); }
    try { whatsapp = await sendWhatsApp(order.whatsapp_number, text); } catch (error) { errors.push(error instanceof Error ? error.message : 'WhatsApp delivery failed'); }
    await admin.from('delivery_logs').upsert([
      { order_id: order.id, channel: 'email', event_key: eventKey, status: email.ok ? 'sent' : email.configured ? 'failed' : 'not_configured', provider_message_id: email.id || null, error_message: email.ok || !email.configured ? null : errors.join('; ') },
      { order_id: order.id, channel: 'whatsapp', event_key: eventKey, status: whatsapp.ok ? 'sent' : whatsapp.configured ? 'failed' : 'not_configured', provider_message_id: whatsapp.id || null, error_message: whatsapp.ok || !whatsapp.configured ? null : errors.join('; ') }
    ], { onConflict: 'order_id,channel,event_key', ignoreDuplicates: true });
    return json({ ok: true, status: 'CONFIRMED', email, whatsapp, errors, libraryUrl, orderNumber: order.order_number }, 200, req);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unable to confirm order.' }, 400, req);
  }
});
