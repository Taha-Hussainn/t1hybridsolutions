const { Redis } = require('@upstash/redis');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
});
const clean = (v, n = 300) => String(v || '').trim().slice(0, n);
const digits = v => String(v || '').replace(/\D/g, '');
const isAdmin = req => process.env.ADMIN_PASSWORD && req.headers['x-admin-key'] === process.env.ADMIN_PASSWORD;
module.exports = { redis, clean, digits, isAdmin };