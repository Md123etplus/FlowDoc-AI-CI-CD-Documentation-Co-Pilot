import { type NextRequest, NextResponse } from "next/server"
import { setSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      console.error("GitHub OAuth error:", error)
      return NextResponse.redirect(new URL("/auth/error?error=oauth_error", request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL("/auth/error?error=no_code", request.url))
    }

    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    const redirectUri = process.env.GITHUB_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      console.error("Missing GitHub OAuth configuration")
      return NextResponse.redirect(new URL("/auth/error?error=config_error", request.url))
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error("GitHub token error:", tokenData.error)
      return NextResponse.redirect(new URL("/auth/error?error=token_error", request.url))
    }

    const accessToken = tokenData.access_token

    if (!accessToken) {
      return NextResponse.redirect(new URL("/auth/error?error=no_token", request.url))
    }

    // Get user information
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!userResponse.ok) {
      throw new Error(`User fetch failed: ${userResponse.status}`)
    }

    const userData = await userResponse.json()

    // Create session
    const session = {
      user: {
        id: userData.id,
        login: userData.login,
        name: userData.name,
        email: userData.email,
        avatar_url: userData.avatar_url,
      },
      accessToken,
    }

    const response = NextResponse.redirect(new URL("/dashboard", request.url))
    await setSession(response, session)

    return response
  } catch (error) {
    console.error("GitHub callback error:", error)
    return NextResponse.redirect(new URL("/auth/error?error=callback_error", request.url))
  }
}
