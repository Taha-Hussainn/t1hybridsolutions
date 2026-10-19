const { redis, clean, isAdmin } = require('../lib/util');
module.exports = async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Wrong password' });
  if (req.method === 'GET') {
    const ids = await redis.lrange('orders', 0, 99);
    const list = ids.length ? await redis.mget(...ids.map(i => 'order:' + i)) : [];
    return res.status(200).json({ orders: list.filter(Boolean) });
  }
  if (req.method === 'PATCH') {
    const { id, status, note } = req.body || {};
    if (!['confirmed', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Bad status' });
    const o = await redis.get('order:' + clean(id, 20));
    if (!o) return res.status(404).json({ error: 'Not found' });
    o.status = status; o.note = clean(note, 300); o.updatedAt = new Date().toISOString();
    await redis.set('order:' + o.id, o);
    return res.status(200).json({ ok: true, order: o });
  }
  res.status(405).end();
};