import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, setUserSession } from "@/lib/auth"
import { GitHubAPI } from "@/lib/github"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth?error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth?error=no_code`)
  }

  try {
    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(code)

    // Get user information
    const github = new GitHubAPI(accessToken)
    const user = await github.getUser()

    // Set session
    await setUserSession({
      accessToken,
      user,
    })

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`)
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth?error=oauth_failed`)
  }
}
