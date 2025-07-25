import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      console.error("GitHub OAuth error:", error)
      return NextResponse.redirect(new URL("/auth/error?error=oauth_error", request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL("/auth/error?error=no_code", request.url))
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
      authenticated: true,
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    // Create a response that will close the popup and notify the parent
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Success</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS' }, window.location.origin);
              window.close();
            } else {
              window.location.href = '/dashboard';
            }
          </script>
          <p>Authentication successful! Redirecting...</p>
        </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("GitHub OAuth callback error:", error)

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'GITHUB_AUTH_ERROR', 
                error: '${error instanceof Error ? error.message : "Authentication failed"}' 
              }, window.location.origin);
              window.close();
            } else {
              window.location.href = '/auth/error?error=callback_error';
            }
          </script>
          <p>Authentication failed. Please try again.</p>
        </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  }
}
