import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ authenticated: false, user: null })
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
    })
  } catch (error) {
    console.error("Error getting session:", error)
    return NextResponse.json({ authenticated: false, user: null })
  }
}
