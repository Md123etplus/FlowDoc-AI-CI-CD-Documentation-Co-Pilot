import { type NextRequest, NextResponse } from "next/server"
import { setUserSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/error?error=${error}`)
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/error?error=no_code`)
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error)
    }

    // Get user information
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user information")
    }

    const userData = await userResponse.json()

    // Create session
    const session = {
      accessToken: tokenData.access_token,
      user: {
        id: userData.id,
        login: userData.login,
        name: userData.name,
        email: userData.email,
        avatar_url: userData.avatar_url,
      },
      authenticated: true,
    }

    await setUserSession(session)

    // Redirect to dashboard
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`)
  } catch (error) {
    console.error("GitHub callback error:", error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/error?error=callback_failed`)
  }
}
