import { type NextRequest, NextResponse } from "next/server"
import { getGitHubOAuthConfig, setUserSession, type User } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      console.error("GitHub OAuth error:", error)
      return NextResponse.redirect("/auth/error?error=oauth_denied")
    }

    if (!code) {
      return NextResponse.redirect("/auth/error?error=missing_code")
    }

    const config = getGitHubOAuthConfig()

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error)
    }

    const accessToken = tokenData.access_token

    // Fetch user information
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "FlowDoc-AI",
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user information")
    }

    const user: User = await userResponse.json()

    // Set session
    await setUserSession({
      user,
      accessToken,
    })

    return NextResponse.redirect("/dashboard")
  } catch (error) {
    console.error("GitHub callback error:", error)
    return NextResponse.redirect("/auth/error?error=callback_failed")
  }
}
