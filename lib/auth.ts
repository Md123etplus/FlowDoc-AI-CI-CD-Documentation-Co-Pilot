import { cookies } from "next/headers"

export interface GitHubOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface UserSession {
  accessToken: string
  user: {
    id: number
    login: string
    name: string | null
    email: string | null
    avatar_url: string
  }
  authenticated: boolean
}

export function getGitHubOAuthConfig(): GitHubOAuthConfig {
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

export async function getUserSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("github_session")

    if (!sessionCookie) {
      return null
    }

    const session = JSON.parse(sessionCookie.value) as UserSession

    // Validate session structure
    if (!session.user || !session.accessToken || !session.authenticated) {
      return null
    }

    return session
  } catch (error) {
    console.error("Error parsing session:", error)
    return null
  }
}

export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("github_session")
}

export function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
