/** Allow only app-owned callback URLs; browser-supplied return URLs are untrusted. */
export function trustedReturnUrl(value: string, expectedPath: string): string | null {
  try {
    const url = new URL(value);
    const allowedOrigins = new Set([
      "https://familycare.familycareitalia.workers.dev",
      ...(process.env.NODE_ENV !== "production"
        ? ["http://localhost:8080", "http://127.0.0.1:8080"]
        : []),
    ]);

    if (
      !allowedOrigins.has(url.origin) ||
      url.pathname !== expectedPath ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}
