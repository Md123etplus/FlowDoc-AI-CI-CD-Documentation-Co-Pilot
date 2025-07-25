import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      console.error("GitHub OAuth error:", error)
      return NextResponse.redirect(
        new URL("/auth/error?error=oauth_denied", process.env.NEXTAUTH_URL || "http://localhost:3000"),
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/auth/error?error=no_code", process.env.NEXTAUTH_URL || "http://localhost:3000"),
      )
    }

    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    const redirectUri = process.env.GITHUB_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      console.error("Missing GitHub OAuth configuration")
      return NextResponse.redirect(
        new URL("/auth/error?error=configuration", process.env.NEXTAUTH_URL || "http://localhost:3000"),
      )
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
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error("Token exchange error:", tokenData.error)
      return NextResponse.redirect(
        new URL("/auth/error?error=token_exchange", process.env.NEXTAUTH_URL || "http://localhost:3000"),
      )
    }

    const accessToken = tokenData.access_token

    // Get user information
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user information")
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
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL || "http://localhost:3000"))
  } catch (error) {
    console.error("GitHub callback error:", error)
    return NextResponse.redirect(
      new URL("/auth/error?error=callback_failed", process.env.NEXTAUTH_URL || "http://localhost:3000"),
    )
  }
}
