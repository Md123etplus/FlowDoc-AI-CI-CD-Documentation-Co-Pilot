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
}

export function getGitHubOAuthConfig(): GitHubOAuthConfig {
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  const redirectUri =
    process.env.GITHUB_REDIRECT_URI ||
    `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"}/api/auth/github/callback`

  if (!clientId) {
    throw new Error("GITHUB_CLIENT_ID environment variable is not set")
  }

  if (!clientSecret) {
    throw new Error("GITHUB_CLIENT_SECRET environment variable is not set")
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
  }
}

export function getAuthorizationUrl(): string {
  try {
    const config = getGitHubOAuthConfig()
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: "repo user:email",
      response_type: "code",
      state: generateRandomState(),
    })

    return `https://github.com/login/oauth/authorize?${params.toString()}`
  } catch (error) {
    console.error("Error generating GitHub authorization URL:", error)
    throw error
  }
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const config = getGitHubOAuthConfig()

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to exchange code for token")
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error_description || data.error)
  }

  return data.access_token
}

export async function setUserSession(session: UserSession): Promise<void> {
  const cookieStore = cookies()

  // In production, you should encrypt this data
  cookieStore.set("github_session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function getUserSession(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("github_session")

    if (!sessionCookie) {
      return null
    }

    return JSON.parse(sessionCookie.value)
  } catch (error) {
    console.error("Error parsing session:", error)
    return null
  }
}

export async function clearUserSession(): Promise<void> {
  const cookieStore = cookies()
  cookieStore.delete("github_session")
}

function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
