import { createClient } from 'npm:@supabase/supabase-js@2';

const ORIGINS = new Set([
  'https://dennisnazar-bookstore.com',
  'https://www.dennisnazar-bookstore.com',
  'https://dennisnazarbookstore.netlify.app',
  'https://kstore.netlify.app',
  'https://4175-icl28leqimffgt4d34yzq-e6f1c394.us4.manus.computer',
  'https://4176-icl28leqimffgt4d34yzq-e6f1c394.us4.manus.computer',
  'http://localhost:4175',
  'http://127.0.0.1:4175',
  'http://localhost:4176',
  'http://127.0.0.1:4176'
]);

export function corsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
  if (origin && ORIGINS.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

export function json(data: unknown, status = 200, req?: Request) {
  return new Response(JSON.stringify(data), { status, headers: { ...(req ? corsHeaders(req) : {}), 'Content-Type': 'application/json' } });
}

export function getAdminClient() {
  const url = Deno.env.get('SUPABASE_URL')!;
  const secret = Deno.env.get('SUPABASE_SECRET_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
}

export function normalizePhone(value: string) {
  let number = String(value || '').replace(/\D/g, '');
  if (number.startsWith('0')) number = '255' + number.slice(1);
  if (!number.startsWith('255')) throw new Error('WhatsApp/mobile number must be a Tanzania number starting with 0 or 255.');
  return '+' + number;
}

export function makeOrderNumber() {
  const date = new Date();
  const stamp = `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(date.getUTCDate()).padStart(2, '0')}`;
  return `DN-${stamp}-${crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

export async function rateLimit(req: Request, admin: any, route: string, identity: string, limit: number, windowSeconds: number) {
  const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const keys = [`${route}|ip|${ip}`, `${route}|identity|${identity}`];
  for (const raw of keys) {
    const key = await digest(raw);
    const result = await admin.rpc('consume_rate_limit', { p_bucket_key: key, p_route: route, p_limit: limit, p_window_seconds: windowSeconds });
    if (result.error) throw new Error('Rate-limit service unavailable.');
    if (!result.data) {
      await admin.from('security_events').insert({ event_type: 'rate_limited', route, key_hash: key, metadata: {} });
      throw new Error('Too many requests. Please wait and try again.');
    }
  }
}
