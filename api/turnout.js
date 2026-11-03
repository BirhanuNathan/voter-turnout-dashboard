// Vercel wrapper: reuses the same Snowflake query as the Netlify function.
const { handler } = require('../netlify/functions/turnout');

module.exports = async (req, res) => {
  const r = await handler();
  Object.entries(r.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
  res.status(r.statusCode).send(r.body);
};
