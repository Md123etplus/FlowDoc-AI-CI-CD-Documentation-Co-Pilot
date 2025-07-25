import { NextResponse } from "next/server"

export async function GET() {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID
    const redirectUri = process.env.GITHUB_REDIRECT_URI

    if (!clientId || !redirectUri) {
      return NextResponse.json({ error: "GitHub OAuth configuration missing" }, { status: 500 })
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "repo user:email",
      response_type: "code",
    })

    const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`

    return NextResponse.json({ url: githubAuthUrl })
  } catch (error) {
    console.error("GitHub OAuth URL generation error:", error)
    return NextResponse.json({ error: "Failed to generate GitHub OAuth URL" }, { status: 500 })
  }
}
