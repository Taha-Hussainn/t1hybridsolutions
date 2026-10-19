const { redis, ip, rateLimit, clean, isAdmin } = require('../lib/util');
module.exports = async (req, res) => {
  if (!isAdmin(req)) {
    const ok = await rateLimit('rl:login:' + ip(req), 10, 900);
    return res.status(ok ? 401 : 429).json({ error: ok ? 'Wrong password' : 'Too many attempts. Try again in 15 minutes.' });
  }
  if (req.method === 'GET') {
    const ids = await redis.lrange('orders', 0, 499);
    const list = ids.length ? await redis.mget(...ids.map(i => 'order:' + i)) : [];
    return res.status(200).json({ orders: list.filter(Boolean) });
  }
  const { id, status, note } = req.body || {};
  const oid = clean(id, 20);
  if (req.method === 'DELETE') {
    await redis.del('order:' + oid); await redis.lrem('orders', 0, oid);
    return res.status(200).json({ ok: true });
  }
  if (req.method === 'PATCH') {
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) return res.status(400).json({ error: 'Bad status' });
    const o = await redis.get('order:' + oid);
    if (!o) return res.status(404).json({ error: 'Not found' });
    o.status = status; o.note = clean(note, 300); o.updatedAt = new Date().toISOString();
    await redis.set('order:' + o.id, o);
    return res.status(200).json({ ok: true, order: o });
  }
  res.status(405).end();
};