const { Redis } = require('@upstash/redis');
const nodemailer = require('nodemailer');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
});
async function telegram(text) {
  const t = process.env.TELEGRAM_BOT_TOKEN, c = process.env.TELEGRAM_CHAT_ID;
  if (!t || !c) return;
  try { await fetch(`https://api.telegram.org/bot${t}/sendMessage`, { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: c, text }) }); } catch (e) {}
}
async function email(to, subject, text) {
  if (!to || !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;
  try {
    const tr = nodemailer.createTransport({ service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
    await tr.sendMail({ from: `"THS Tier-1 Hybrid Solutions" <${process.env.GMAIL_USER}>`, to, subject, text });
  } catch (e) { console.error('mail', e.message); }
}
const clean = (v, n = 300) => String(v || '').trim().slice(0, n);
const digits = v => String(v || '').replace(/\D/g, '');
const isAdmin = req => process.env.ADMIN_PASSWORD && req.headers['x-admin-key'] === process.env.ADMIN_PASSWORD;
module.exports = { redis, telegram, email, clean, digits, isAdmin };