import { corsHeaders, getAdminClient, json, makeOrderNumber, normalizePhone, rateLimit } from './_shared.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.headers.get('Origin') && !corsHeaders(req)['Access-Control-Allow-Origin']) return json({ error: 'Origin not allowed.' }, 403, req);
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, req);
  try {
    const form = await req.formData();
    const name = String(form.get('customer_name') || '').trim();
    const email = String(form.get('customer_email') || '').trim().toLowerCase();
    const phone = normalizePhone(String(form.get('whatsapp_number') || ''));
    const transactionId = String(form.get('transaction_id') || '').trim();
    const items = JSON.parse(String(form.get('items') || '[]'));
    const screenshot = form.get('payment_screenshot');
    const supabase = getAdminClient();

    await rateLimit(req, supabase, 'create-order', email || 'anonymous', 5, 600);
    if (!name || name.length > 120 || !email || !email.includes('@') || email.length > 254) throw new Error('Enter a valid customer name and email.');
    if (!Array.isArray(items) || !items.length) throw new Error('Cart is empty.');
    if (!transactionId && !(screenshot instanceof File)) throw new Error('Enter a transaction ID or upload a payment screenshot.');
    if (transactionId && (transactionId.length < 3 || transactionId.length > 120)) throw new Error('Transaction ID must be between 3 and 120 characters.');
    if (screenshot instanceof File) {
      if (screenshot.size > 8 * 1024 * 1024) throw new Error('Payment screenshot must be 8MB or smaller.');
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(screenshot.type)) throw new Error('Screenshot must be JPG, PNG or WEBP.');
    }
    if (items.some((item: any) => !item || typeof item !== 'object' || (item.quantity !== undefined && Number(item.quantity) !== 1))) throw new Error('Invalid book quantity.');
    const ids = [...new Set(items.map((item: any) => String(item.id)))];
    if (ids.length !== items.length) throw new Error('Duplicate books are not allowed in one order.');
    if (transactionId) {
      const duplicate = await supabase.from('orders').select('id,order_number,status').eq('transaction_id', transactionId).limit(1).maybeSingle();
      if (duplicate.error) throw duplicate.error;
      if (duplicate.data) throw new Error(`This transaction ID has already been submitted with order ${duplicate.data.order_number}.`);
    }
    const booksResult = await supabase.from('books').select('id,title,price,available,status').in('id', ids);
    if (booksResult.error) throw booksResult.error;
    const byId = new Map((booksResult.data || []).map((book: any) => [book.id, book]));
    if (ids.some((id) => !byId.has(id))) throw new Error('One or more selected books no longer exist.');
    let amount = 0;
    const snapshots = [];
    for (const item of items) {
      const book = byId.get(String(item.id));
      if (!book.available || book.status === 'inactive' || Number(book.price) <= 0) throw new Error(`Book unavailable: ${book.title}`);
      amount += Number(book.price);
      snapshots.push({ book_id: book.id, title_snapshot: book.title, price: Number(book.price), quantity: 1 });
    }
    const orderNumber = makeOrderNumber();
    let proofPath = null;
    if (screenshot instanceof File) {
      const safe = screenshot.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
      proofPath = `${orderNumber}/${crypto.randomUUID()}-${safe}`;
      const upload = await supabase.storage.from('payment-proofs').upload(proofPath, screenshot, { contentType: screenshot.type, upsert: false });
      if (upload.error) throw upload.error;
    }
    const orderResult = await supabase.from('orders').insert({ order_number: orderNumber, customer_name: name, customer_email: email, whatsapp_number: phone, amount, currency: 'TZS', transaction_id: transactionId || null, payment_screenshot_path: proofPath, status: 'PENDING_VERIFICATION' }).select('id,order_number,amount,status').single();
    if (orderResult.error) {
      if (proofPath) await supabase.storage.from('payment-proofs').remove([proofPath]);
      throw orderResult.error;
    }
    const itemResult = await supabase.from('order_items').insert(snapshots.map((item) => ({ ...item, order_id: orderResult.data.id })));
    if (itemResult.error) {
      await supabase.from('orders').delete().eq('id', orderResult.data.id);
      if (proofPath) await supabase.storage.from('payment-proofs').remove([proofPath]);
      throw itemResult.error;
    }
    return json({ ok: true, order: { id: orderResult.data.id, orderNumber, amount, status: orderResult.data.status } }, 200, req);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unable to create order.' }, 400, req);
  }
});
