import { NextResponse } from "next/server"
import { getAuthorizationUrl } from "@/lib/auth"

export async function GET() {
  try {
    const authUrl = getAuthorizationUrl()
    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error("GitHub auth error:", error)
    return NextResponse.json({ error: "Failed to generate authorization URL" }, { status: 500 })
  }
}
