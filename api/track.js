const { redis, clean, digits } = require('../lib/util');
module.exports = async (req, res) => {
  const id = clean(req.query.id, 20).toUpperCase(), ph = digits(req.query.phone);
  const o = await redis.get('order:' + id);
  if (!o || digits(o.phone).slice(-10) !== ph.slice(-10)) return res.status(404).json({ error: 'Order not found. Check Order ID and phone.' });
  res.status(200).json({ id: o.id, service: o.service, status: o.status, note: o.note, createdAt: o.createdAt });
};