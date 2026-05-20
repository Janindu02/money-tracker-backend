/** Resolve DB URL from Vercel/Neon env names and keep Prisma in sync. */
export function resolveDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.NEON_DATABASE_URL ??
    ''
  );
}

export function syncDatabaseUrlEnv(): string {
  const url = resolveDatabaseUrl();
  if (url) {
    process.env.DATABASE_URL = url;
  }
  return url;
}

export function getDatabaseHost(url: string): string {
  try {
    return new URL(url.replace(/^postgresql:\/\//, 'https://')).hostname;
  } catch {
    return 'unknown';
  }
}
