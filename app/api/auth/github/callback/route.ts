import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, setUserSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    console.error("GitHub OAuth error:", error)
    return NextResponse.redirect(new URL(`/auth/error?message=${encodeURIComponent(error)}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth/error?message=No+authorization+code+received", request.url))
  }

  try {
    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(code)

    // Get user information from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user information")
    }

    const user = await userResponse.json()

    // Set user session
    await setUserSession({
      accessToken,
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
      },
    })

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("Error during GitHub OAuth callback:", error)
    return NextResponse.redirect(new URL("/auth/error?message=Authentication+failed", request.url))
  }
}
