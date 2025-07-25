import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error("Session API error:", error)
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
}
