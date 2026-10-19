const { redis, telegram, email, clean, digits } = require('../lib/util');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const b = req.body || {};
  if (b._honey) return res.status(200).json({ ok: true });
  const o = { name: clean(b.name, 80), phone: clean(b.phone, 20), email: clean(b.email, 100), city: clean(b.city, 50),
    address: clean(b.address, 200), service: clean(b.service, 60), capacity: clean(b.capacity, 60),
    date: clean(b.date, 30), details: clean(b.details, 800) };
  if (!o.name || digits(o.phone).length < 10 || !o.city || !o.address || !o.service)
    return res.status(400).json({ error: 'Please fill all required fields.' });
  if (o.email && !/^\S+@\S+\.\S+$/.test(o.email)) return res.status(400).json({ error: 'Invalid email.' });
  const id = 'THS-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const order = { id, ...o, status: 'pending', note: '', createdAt: new Date().toISOString() };
  try {
    await redis.set('order:' + id, order);
    await redis.lpush('orders', id);
  } catch (e) { return res.status(500).json({ error: 'Could not save order. Try again.' }); }
  await Promise.all([
    telegram(`🔔 NEW ORDER ${id}\n${o.name} - ${o.phone}\n${o.city}, ${o.address}\nService: ${o.service} ${o.capacity}\nDate: ${o.date || '-'}\n${o.details}`),
    email(o.email, `Order ${id} received - THS`, `Dear ${o.name},\n\nThank you! We received your order ${id} for ${o.service}.\nWe will confirm it shortly. Track it anytime on our website using your Order ID and phone number.\n\nTHS - Tier-1 Hybrid Solutions`)
  ]);
  res.status(200).json({ ok: true, id });
};