import type { NextResponse } from "next/server"
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
const SESSION_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret-key"

export async function setSession(response: NextResponse, session: Session) {
  const sessionData = JSON.stringify(session)
  const encodedSession = Buffer.from(sessionData).toString("base64")

  response.cookies.set(SESSION_COOKIE_NAME, encodedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie?.value) {
      return null
    }

    const sessionData = Buffer.from(sessionCookie.value, "base64").toString("utf-8")
    const session = JSON.parse(sessionData) as Session

    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function clearSession(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE_NAME)
}
