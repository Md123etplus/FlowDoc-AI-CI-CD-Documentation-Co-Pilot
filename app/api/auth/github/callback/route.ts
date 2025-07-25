import { NextResponse } from "next/server"
import { exchangeCodeForToken, setUserSession } from "@/lib/auth"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const error = url.searchParams.get("error")

  // Handle errors from GitHub OAuth
  if (error) {
    const redirectUrl = new URL("/auth", url.origin)
    redirectUrl.searchParams.set("error", error)
    return NextResponse.redirect(redirectUrl.toString())
  }

  // No code provided
  if (!code) {
    const redirectUrl = new URL("/auth", url.origin)
    redirectUrl.searchParams.set("error", "no_code")
    return NextResponse.redirect(redirectUrl.toString())
  }

  try {
    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(code)

    // Get user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user data")
    }

    const userData = await userResponse.json()

    // Set user session
    await setUserSession({
      accessToken,
      user: {
        id: userData.id,
        login: userData.login,
        name: userData.name,
        email: userData.email,
        avatar_url: userData.avatar_url,
      },
    })

    // Create HTML for popup close
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              padding: 20px;
              text-align: center;
              color: #333;
              background-color: #f9fafb;
            }
            .success-icon {
              width: 60px;
              height: 60px;
              background-color: #10b981;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20px;
            }
            h1 {
              margin-bottom: 10px;
            }
            p {
              margin-bottom: 20px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1>Authentication Successful</h1>
          <p>You can close this window and return to the application.</p>
          <script>
            window.opener.postMessage({ type: 'auth-success' }, window.location.origin);
            setTimeout(() => window.close(), 1500);
          </script>
        </body>
      </html>
    `

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("Authentication error:", error)

    const redirectUrl = new URL("/auth", url.origin)
    redirectUrl.searchParams.set("error", "oauth_failed")
    return NextResponse.redirect(redirectUrl.toString())
  }
}
