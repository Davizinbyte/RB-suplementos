let requests = {};

export default function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || 'unknown';

  if (!requests[ip]) requests[ip] = 0;
  requests[ip]++;

  if (requests[ip] > 20) {
    return res.status(429).json({ error: "Muitas requisições" });
  }

  setTimeout(() => {
    requests[ip]--;
  }, 60000);

  // resto...
}
// api/data.js - GET /api/data → retorna produtos, contato e homeData publicamente
const { getDb, cors } = require('./config');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = getDb();
    const snap = await db.collection('store').doc('config').get();
    if (!snap.exists) {
      return res.status(200).json({ prods: [], contact: {}, homeData: {} });
    }
    const d = snap.data();
    // Retorna apenas dados publicos — SEM creds de admin
    res.status(200).json({
      prods: d.prods || [],
      contact: d.contact || {},
      homeData: d.homeData || {},
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
