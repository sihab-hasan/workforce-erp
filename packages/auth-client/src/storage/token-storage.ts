const TOKEN_STORAGE_KEY = "workforce-erp.auth.token"

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string) {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearStoredToken() {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY)
}
