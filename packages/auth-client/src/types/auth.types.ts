export type SessionStatus = "anonymous" | "authenticated"

export type AuthUser = {
  id: string
  email: string
  name: string
}

export type AuthSession = {
  accessToken: string
  user: AuthUser
}
