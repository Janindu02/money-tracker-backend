/** Comma-separated FRONTEND_URL values, e.g. https://finovam.netlify.app,http://localhost:3000 */
export function parseCorsOrigins(frontendUrl: string): string[] {
  return frontendUrl
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
