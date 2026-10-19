const { redis, clean, digits } = require('../lib/util');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const b = req.body || {};
  if (b._honey) return res.status(200).json({ ok: true });
  const o = { name: clean(b.name, 80), phone: clean(b.phone, 20), city: clean(b.city, 50),
    address: clean(b.address, 200), service: clean(b.service, 60), capacity: clean(b.capacity, 60),
    date: clean(b.date, 30), details: clean(b.details, 800) };
  if (!o.name || digits(o.phone).length < 10 || !o.city || !o.address || !o.service)
    return res.status(400).json({ error: 'Please fill all required fields.' });
  const id = 'THS-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const order = { id, ...o, status: 'pending', note: '', createdAt: new Date().toISOString() };
  try {
    await redis.set('order:' + id, order);
    await redis.lpush('orders', id);
  } catch (e) { return res.status(500).json({ error: 'Could not save order. Try again.' }); }
  res.status(200).json({ ok: true, id });
};