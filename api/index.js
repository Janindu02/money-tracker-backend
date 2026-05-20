const { createApp } = require('../dist/src/server');

let server;

function resolveDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    ''
  );
}

function assertDatabaseUrl() {
  const url = resolveDatabaseUrl();
  if (!url) {
    throw new Error(
      'DATABASE_URL is missing. In Vercel → Settings → Environment Variables, add DATABASE_URL with your Neon connection string, then redeploy.',
    );
  }
  if (/localhost|127\.0\.0\.1/.test(url)) {
    throw new Error(
      'DATABASE_URL points to localhost. Replace it with your Neon URL in Vercel → Settings → Environment Variables, then redeploy.',
    );
  }
  process.env.DATABASE_URL = url;
}

module.exports = async function handler(req, res) {
  try {
    assertDatabaseUrl();
    if (!server) {
      server = await createApp();
    }
    return server(req, res);
  } catch (err) {
    console.error(err);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        status: 'error',
        message: err instanceof Error ? err.message : 'Server failed to start',
      }),
    );
  }
};
