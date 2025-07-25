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
    const sessionCookie = cookieStore.get("github_session")

    if (!sessionCookie?.value) {
      return null
    }

    const session = JSON.parse(sessionCookie.value)

    if (!session.accessToken || !session.user) {
      return null
    }

    return {
      ...session,
      authenticated: true,
    }
  } catch (error) {
    console.error("Error getting user session:", error)
    return null
  }
}

export async function setUserSession(session: Omit<UserSession, "authenticated">) {
  const cookieStore = await cookies()

  cookieStore.set(
    "github_session",
    JSON.stringify({
      ...session,
      authenticated: true,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    },
  )
}

export async function clearUserSession() {
  const cookieStore = await cookies()
  cookieStore.delete("github_session")
}

export function generateGitHubAuthUrl(): string {
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = process.env.GITHUB_REDIRECT_URI

  if (!clientId || !redirectUri) {
    throw new Error("GitHub OAuth configuration is missing")
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo user:email",
    response_type: "code",
  })

  return `https://github.com/login/oauth/authorize?${params.toString()}`
}
