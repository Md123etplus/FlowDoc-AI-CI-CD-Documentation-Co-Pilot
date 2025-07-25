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
  authenticated: boolean
}

export async function getUserSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("github-session")

    if (!sessionCookie) {
      return null
    }

    const session = JSON.parse(sessionCookie.value)
    return session
  } catch (error) {
    console.error("Error getting user session:", error)
    return null
  }
}

export async function setUserSession(session: UserSession): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set("github-session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })
  } catch (error) {
    console.error("Error setting user session:", error)
  }
}

export async function clearUserSession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("github-session")
  } catch (error) {
    console.error("Error clearing user session:", error)
  }
}

export function getGitHubAuthUrl(): string {
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/github/callback`

  if (!clientId) {
    throw new Error("GITHUB_CLIENT_ID is not configured")
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo user:email",
    response_type: "code",
  })

  return `https://github.com/login/oauth/authorize?${params.toString()}`
}
