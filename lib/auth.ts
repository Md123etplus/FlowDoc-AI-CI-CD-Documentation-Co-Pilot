import { cookies } from "next/headers"

export interface User {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
}

export interface Session {
  user: User
  accessToken: string
}

const SESSION_COOKIE_NAME = "github_session"

export async function getUserSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie?.value) {
      return null
    }

    const sessionData = Buffer.from(sessionCookie.value, "base64").toString("utf-8")
    const session = JSON.parse(sessionData) as Session

    // Validate session structure
    if (!session.user || !session.accessToken) {
      return null
    }

    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function setUserSession(session: Session): Promise<void> {
  const cookieStore = await cookies()
  const sessionData = JSON.stringify(session)
  const encodedSession = Buffer.from(sessionData).toString("base64")

  cookieStore.set(SESSION_COOKIE_NAME, encodedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export function getGitHubOAuthConfig() {
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  const redirectUri = process.env.GITHUB_REDIRECT_URI

  if (!clientId) {
    throw new Error("GITHUB_CLIENT_ID environment variable is not set")
  }

  if (!clientSecret) {
    throw new Error("GITHUB_CLIENT_SECRET environment variable is not set")
  }

  if (!redirectUri) {
    throw new Error("GITHUB_REDIRECT_URI environment variable is not set")
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
  }
}

export function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
