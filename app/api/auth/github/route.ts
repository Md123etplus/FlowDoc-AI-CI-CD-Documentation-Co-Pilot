import { NextResponse } from "next/server"
import { getGitHubOAuthConfig, generateRandomState } from "@/lib/auth"

export async function GET() {
  try {
    const config = getGitHubOAuthConfig()
    const state = generateRandomState()

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: "repo user:email",
      response_type: "code",
      state,
    })

    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("GitHub OAuth error:", error)
    return NextResponse.redirect("/auth/error?error=oauth_config_error")
  }
}
