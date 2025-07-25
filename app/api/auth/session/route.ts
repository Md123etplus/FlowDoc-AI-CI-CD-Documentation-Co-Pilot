import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getUserSession()

    return NextResponse.json({
      authenticated: !!session,
      user: session
        ? {
            login: session.user.login,
            name: session.user.name,
            avatar_url: session.user.avatar_url,
          }
        : null,
    })
  } catch (error) {
    console.error("Error checking session:", error)
    return NextResponse.json({ authenticated: false, error: "Failed to check authentication status" }, { status: 500 })
  }
}
