import { NextResponse } from "next/server"
import { generateGitHubAuthUrl } from "@/lib/auth"

export async function GET() {
  try {
    const authUrl = generateGitHubAuthUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("GitHub auth error:", error)
    return NextResponse.json({ error: "Failed to initiate GitHub authentication" }, { status: 500 })
  }
}
