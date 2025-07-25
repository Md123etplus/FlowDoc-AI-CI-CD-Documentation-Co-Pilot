import { NextResponse } from "next/server"
import { getGitHubAuthUrl } from "@/lib/auth"

export async function GET() {
  try {
    const authUrl = getGitHubAuthUrl()
    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error("Error generating GitHub auth URL:", error)
    return NextResponse.json({ error: "Failed to generate GitHub auth URL" }, { status: 500 })
  }
}
