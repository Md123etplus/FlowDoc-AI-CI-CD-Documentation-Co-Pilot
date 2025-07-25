import { NextResponse } from "next/server"

export async function GET() {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID
    const redirectUri = process.env.GITHUB_REDIRECT_URI

    if (!clientId || !redirectUri) {
      console.error("Missing GitHub OAuth configuration:", {
        clientId: !!clientId,
        redirectUri: !!redirectUri,
      })
      return NextResponse.json({ error: "GitHub OAuth not configured properly" }, { status: 500 })
    }

    const scope = "repo user:email"
    const state = Math.random().toString(36).substring(2, 15)

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&scope=${encodeURIComponent(scope)}&state=${state}`

    return NextResponse.redirect(githubAuthUrl)
  } catch (error) {
    console.error("GitHub OAuth error:", error)
    return NextResponse.json({ error: "Failed to initiate GitHub OAuth" }, { status: 500 })
  }
}
