import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, setUserSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  // Handle OAuth errors
  if (error) {
    const errorDescription = searchParams.get("error_description") || error
    return NextResponse.redirect(new URL(`/auth/error?error=${encodeURIComponent(errorDescription)}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth/error?error=No authorization code received", request.url))
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

    const userData = await userResponse.json()

    // Create user session
    const session = {
      accessToken,
      user: {
        id: userData.id,
        login: userData.login,
        name: userData.name,
        email: userData.email,
        avatar_url: userData.avatar_url,
      },
    }

    await setUserSession(session)

    // Return success page that will communicate with parent window
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f8fafc;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .success-icon {
              color: #10b981;
              font-size: 3rem;
              margin-bottom: 1rem;
            }
            h1 {
              color: #1f2937;
              margin-bottom: 0.5rem;
            }
            p {
              color: #6b7280;
              margin-bottom: 1.5rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✓</div>
            <h1>Authentication Successful!</h1>
            <p>You can now close this window and return to the application.</p>
          </div>
          <script>
            // Send success message to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'GITHUB_AUTH_SUCCESS',
                user: ${JSON.stringify(session.user)}
              }, window.location.origin);
            }
            
            // Auto-close after 2 seconds
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    )
  } catch (error) {
    console.error("GitHub OAuth callback error:", error)

    // Return error page that will communicate with parent window
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Failed</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f8fafc;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .error-icon {
              color: #ef4444;
              font-size: 3rem;
              margin-bottom: 1rem;
            }
            h1 {
              color: #1f2937;
              margin-bottom: 0.5rem;
            }
            p {
              color: #6b7280;
              margin-bottom: 1.5rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">✗</div>
            <h1>Authentication Failed</h1>
            <p>There was an error during authentication. Please try again.</p>
          </div>
          <script>
            // Send error message to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'GITHUB_AUTH_ERROR',
                error: '${error instanceof Error ? error.message : "Authentication failed"}'
              }, window.location.origin);
            }
            
            // Auto-close after 3 seconds
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    )
  }
}
