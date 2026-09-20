const NAVY = '#211d5a';
const ORANGE = '#f47721';
const INK = '#242238';
const MUTED = '#686772';
const SOFT = '#f6f5f8';
const LINE = '#e4e3e7';
const SITE = 'https://dennisnazar-bookstore.com';

function esc(value: unknown) {
  return String(value ?? '').replace(/[&<>"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[char] || char));
}

function absoluteUrl(path: string, siteUrl = SITE) {
  return `${siteUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function shell(content: string, siteUrl = SITE, preheader = 'Dennis Nazar — Official Books Store') {
  const logo = absoluteUrl('assets/dn-logo-white.png', siteUrl);
  const home = siteUrl.replace(/\/$/, '');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Dennis Nazar — Official Books Store</title>
</head>
<body style="margin:0;padding:0;background:#ececf0;font-family:Arial,Helvetica,sans-serif;color:${INK};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ececf0;">
    <tr>
      <td align="center" style="padding:28px 10px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:#ffffff;">
          <tr>
            <td align="center" style="background:${NAVY};padding:30px 24px 28px;">
              <a href="${home}" style="display:inline-block;text-decoration:none;">
                <img src="${logo}" width="190" alt="Dennis Nazar" style="display:block;width:190px;max-width:82%;height:auto;border:0;">
              </a>
              <div style="margin-top:13px;font-size:10px;line-height:1.4;letter-spacing:3px;font-weight:800;color:#ffffff;text-transform:uppercase;">DENNIS NAZAR · OFFICIAL BOOKS STORE</div>
            </td>
          </tr>
          ${content}
          <tr>
            <td style="background:${NAVY};padding:21px 28px;text-align:center;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;color:#ffffff;margin-bottom:5px;">Dennis Nazar</div>
              <div style="font-size:9px;line-height:1.6;letter-spacing:1.5px;color:#c9c7d7;text-transform:uppercase;">Author · Teacher · Mentor</div>
              <div style="height:1px;background:rgba(255,255,255,.15);margin:15px auto;width:70%;"></div>
              <div style="font-size:10px;line-height:1.6;color:#aaa8ba;">Official Dennis Nazar Books Store · Private Library</div>
              <div style="font-size:10px;line-height:1.6;margin-top:7px;"><a href="${home}" style="color:#ffffff;text-decoration:underline;">dennisnazar-bookstore.com</a></div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(label: string, href: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
    <tr>
      <td style="background:${ORANGE};border-radius:4px;">
        <a href="${esc(href)}" style="display:inline-block;padding:14px 24px;font-size:13px;line-height:1;font-weight:800;letter-spacing:.2px;color:#ffffff;text-decoration:none;">${esc(label)}</a>
      </td>
    </tr>
  </table>`;
}

function panel(kicker: string, title: string, body: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;background:${SOFT};border-left:3px solid ${ORANGE};">
    <tr><td style="padding:15px 16px;">
      <div style="font-size:9px;line-height:1.5;letter-spacing:1.5px;font-weight:800;color:${ORANGE};text-transform:uppercase;margin-bottom:5px;">${esc(kicker)}</div>
      <div style="font-size:13px;line-height:1.5;font-weight:700;color:${NAVY};">${esc(title)}</div>
      <div style="font-size:11px;line-height:1.6;color:#777680;margin-top:3px;">${body}</div>
    </td></tr>
  </table>`;
}

export function paymentConfirmedEmail(input: {
  customerName: string;
  orderNumber: string;
  titles: string;
  libraryUrl: string;
  siteUrl?: string;
}) {
  const name = esc(input.customerName || 'there');
  const order = esc(input.orderNumber);
  const titles = esc(input.titles);
  const content = `<tr>
    <td style="padding:36px 40px 30px;background:#ffffff;">
      <div style="font-size:10px;line-height:1.5;letter-spacing:2px;font-weight:800;color:${ORANGE};text-transform:uppercase;margin-bottom:12px;">PAYMENT CONFIRMED</div>
      <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.18;color:${NAVY};font-weight:700;">Your order is confirmed.</h1>
      <p style="margin:0 0 13px;font-size:15px;line-height:1.7;color:#4f4e59;">Hello ${name},</p>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.8;color:${MUTED};">Your payment has been verified successfully. Your purchased books are now connected to your private Dennis Nazar Library.</p>
      ${panel('ORDER', input.orderNumber, `Books: <strong style="color:${NAVY};">${titles}</strong>`)}
      ${button('OPEN MY LIBRARY', input.libraryUrl)}
      <p style="margin:0 0 10px;font-size:12px;line-height:1.7;color:#777680;">Sign in with the same email address used during checkout.</p>
      <p style="margin:0;font-size:12px;line-height:1.7;color:#777680;">Keep this email for your order reference: <strong style="color:${NAVY};">${order}</strong></p>
      <div style="height:1px;background:${LINE};margin:27px 0 19px;"></div>
      <p style="margin:0;font-size:11px;line-height:1.6;color:#8a8992;">If you need help with your order, contact <a href="mailto:dennisnazar123@gmail.com" style="color:${NAVY};">dennisnazar123@gmail.com</a>.</p>
    </td>
  </tr>`;
  return shell(content, input.siteUrl, `Payment confirmed — order ${input.orderNumber}`);
}

export function libraryAccessEmail(input: {
  customerName: string;
  libraryUrl: string;
  siteUrl?: string;
}) {
  const name = esc(input.customerName || 'there');
  const content = `<tr>
    <td style="padding:36px 40px 30px;background:#ffffff;">
      <div style="font-size:10px;line-height:1.5;letter-spacing:2px;font-weight:800;color:${ORANGE};text-transform:uppercase;margin-bottom:12px;">PRIVATE LIBRARY ACCESS</div>
      <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.18;color:${NAVY};font-weight:700;">Your library is ready.</h1>
      <p style="margin:0 0 13px;font-size:15px;line-height:1.7;color:#4f4e59;">Hello ${name},</p>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.8;color:${MUTED};">Your Dennis Nazar Private Library is ready. Use the secure button below to open your books and continue reading.</p>
      ${panel('PRIVATE LIBRARY', 'Your books are waiting.', 'Secure reading access for verified purchases.')}
      ${button('OPEN MY LIBRARY', input.libraryUrl)}
      <p style="margin:0;font-size:12px;line-height:1.7;color:#777680;">If you did not request this email, you can safely ignore it.</p>
    </td>
  </tr>`;
  return shell(content, input.siteUrl, 'Your Dennis Nazar Private Library is ready.');
}

export function paymentRejectedEmail(input: {
  customerName: string;
  orderNumber: string;
  reason?: string;
  siteUrl?: string;
}) {
  const name = esc(input.customerName || 'there');
  const reason = esc(input.reason || 'We could not verify the payment information submitted for this order.');
  const trackUrl = absoluteUrl(`track.html?order=${encodeURIComponent(input.orderNumber)}`, input.siteUrl || SITE);
  const content = `<tr>
    <td style="padding:36px 40px 30px;background:#ffffff;">
      <div style="font-size:10px;line-height:1.5;letter-spacing:2px;font-weight:800;color:${ORANGE};text-transform:uppercase;margin-bottom:12px;">PAYMENT VERIFICATION UPDATE</div>
      <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.18;color:${NAVY};font-weight:700;">We need to review your payment.</h1>
      <p style="margin:0 0 13px;font-size:15px;line-height:1.7;color:#4f4e59;">Hello ${name},</p>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.8;color:${MUTED};">Your order has not been confirmed because the submitted payment could not be verified.</p>
      ${panel('ORDER', input.orderNumber, reason)}
      <p style="margin:0 0 24px;font-size:13px;line-height:1.8;color:${MUTED};">Please review your payment details and contact the store if you believe this was a mistake.</p>
      ${button('VIEW ORDER STATUS', trackUrl)}
      <p style="margin:0;font-size:12px;line-height:1.7;color:#777680;">Support: <a href="mailto:dennisnazar123@gmail.com" style="color:${NAVY};">dennisnazar123@gmail.com</a></p>
    </td>
  </tr>`;
  return shell(content, input.siteUrl, `Payment verification update — order ${input.orderNumber}`);
}

export { esc };
