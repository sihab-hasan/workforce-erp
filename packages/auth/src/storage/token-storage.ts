/**
 * Browser authentication uses Laravel Sanctum HttpOnly cookies.
 * These compatibility functions intentionally never persist or expose credentials.
 */
export function getStoredToken(): null {
  return null;
}

export function setStoredToken(_token: string): void {
  // Intentionally ignored: browser credentials must never be stored in Web Storage.
}

export function clearStoredToken(): void {
  // No browser token is stored; server-side logout/session revocation is authoritative.
}
