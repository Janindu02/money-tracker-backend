"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDatabaseUrl = resolveDatabaseUrl;
exports.syncDatabaseUrlEnv = syncDatabaseUrlEnv;
exports.getDatabaseHost = getDatabaseHost;
function resolveDatabaseUrl() {
    return (process.env.DATABASE_URL ??
        process.env.POSTGRES_PRISMA_URL ??
        process.env.POSTGRES_URL ??
        process.env.NEON_DATABASE_URL ??
        '');
}
function syncDatabaseUrlEnv() {
    const url = resolveDatabaseUrl();
    if (url) {
        process.env.DATABASE_URL = url;
    }
    return url;
}
function getDatabaseHost(url) {
    try {
        return new URL(url.replace(/^postgresql:\/\//, 'https://')).hostname;
    }
    catch {
        return 'unknown';
    }
}
//# sourceMappingURL=database-url.js.map