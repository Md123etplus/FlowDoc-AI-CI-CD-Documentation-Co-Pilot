import { NextResponse } from "next/server"

export async function GET() {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID
    const redirectUri = process.env.GITHUB_REDIRECT_URI

    if (!clientId) {
      console.error("GITHUB_CLIENT_ID is not set")
      return NextResponse.redirect(
        new URL(
          "/auth/error?message=Missing+GitHub+OAuth+configuration",
          process.env.NEXTAUTH_URL || "http://localhost:3000",
        ),
      )
    }

    if (!redirectUri) {
      console.error("GITHUB_REDIRECT_URI is not set")
      return NextResponse.redirect(
        new URL(
          "/auth/error?message=Missing+GitHub+OAuth+configuration",
          process.env.NEXTAUTH_URL || "http://localhost:3000",
        ),
      )
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "repo user:email",
      response_type: "code",
      state: generateRandomState(),
    })

    const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`

    return NextResponse.redirect(githubAuthUrl)
  } catch (error) {
    console.error("GitHub OAuth error:", error)
    return NextResponse.redirect(
      new URL("/auth/error?message=GitHub+OAuth+error", process.env.NEXTAUTH_URL || "http://localhost:3000"),
    )
  }
}

function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
