import { NextResponse } from "next/server"
import { getAuthorizationUrl } from "@/lib/auth"

export async function GET() {
  try {
    const authUrl = getAuthorizationUrl()
    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("Error generating GitHub auth URL:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate authorization URL" },
      { status: 500 },
    )
  }
}
