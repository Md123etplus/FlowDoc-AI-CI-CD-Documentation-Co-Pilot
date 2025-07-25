import { NextResponse } from "next/server"

export async function GET() {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID
    const redirectUri = process.env.GITHUB_REDIRECT_URI

    if (!clientId || !redirectUri) {
      console.error("Missing GitHub OAuth configuration")
      return NextResponse.redirect(
        new URL("/auth/error?error=configuration", process.env.NEXTAUTH_URL || "http://localhost:3000"),
      )
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "user:email repo",
      response_type: "code",
    })

    const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`

    return NextResponse.redirect(githubAuthUrl)
  } catch (error) {
    console.error("GitHub OAuth error:", error)
    return NextResponse.redirect(
      new URL("/auth/error?error=oauth_failed", process.env.NEXTAUTH_URL || "http://localhost:3000"),
    )
  }
}
