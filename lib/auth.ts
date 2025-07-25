import { cookies } from "next/headers"

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

export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("github_session")

  if (!sessionCookie) {
    return null
  }

  try {
    return JSON.parse(decodeURIComponent(sessionCookie.value)) as UserSession
  } catch (error) {
    console.error("Error parsing session cookie:", error)
    return null
  }
}

export function getGitHubAuthUrl(): string {
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`

  if (!clientId) {
    throw new Error("GitHub client ID is not defined")
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user repo",
    state: Math.random().toString(36).substring(7),
  })

  return `https://github.com/login/oauth/authorize?${params.toString()}`
}
