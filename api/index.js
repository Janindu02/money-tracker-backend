const { createApp } = require('../dist/src/server');

let server;

function assertDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? '';
  if (!url) {
    throw new Error(
      'DATABASE_URL is missing. Add your Neon URL in Vercel → Settings → Environment Variables, then redeploy.',
    );
  }
  if (/localhost|127\.0\.0\.1/.test(url)) {
    throw new Error(
      'DATABASE_URL still points to localhost. Replace it with your Neon URL in Vercel → Settings → Environment Variables, then redeploy.',
    );
  }
}

module.exports = async function handler(req, res) {
  assertDatabaseUrl();
  if (!server) {
    server = await createApp();
  }
  return server(req, res);
};
