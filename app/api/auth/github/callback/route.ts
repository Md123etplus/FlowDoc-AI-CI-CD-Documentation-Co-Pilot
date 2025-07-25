import { exchangeCodeForToken, setUserSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get("code")
    const error = url.searchParams.get("error")

    if (error) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Error</title>
            <style>
              body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .container { text-align: center; max-width: 500px; padding: 2rem; }
              .error { color: #e11d48; margin-bottom: 1rem; }
              .message { margin-bottom: 2rem; color: #4b5563; }
            </style>
            <script>
              window.onload = function() {
                window.opener && window.opener.postMessage({ type: 'auth-error', error: '${error}' }, window.location.origin);
                setTimeout(function() { window.close(); }, 5000);
              }
            </script>
          </head>
          <body>
            <div class="container">
              <h2 class="error">Authentication Failed</h2>
              <p class="message">GitHub authentication was unsuccessful: ${error}</p>
              <p>This window will close automatically in a few seconds.</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: {
            "Content-Type": "text/html",
          },
        },
      )
    }

    if (!code) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Error</title>
            <style>
              body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .container { text-align: center; max-width: 500px; padding: 2rem; }
              .error { color: #e11d48; margin-bottom: 1rem; }
              .message { margin-bottom: 2rem; color: #4b5563; }
            </style>
            <script>
              window.onload = function() {
                window.opener && window.opener.postMessage({ type: 'auth-error', error: 'No authorization code received' }, window.location.origin);
                setTimeout(function() { window.close(); }, 5000);
              }
            </script>
          </head>
          <body>
            <div class="container">
              <h2 class="error">Authentication Failed</h2>
              <p class="message">No authorization code was received from GitHub.</p>
              <p>This window will close automatically in a few seconds.</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: {
            "Content-Type": "text/html",
          },
        },
      )
    }

    // Exchange the code for an access token
    const accessToken = await exchangeCodeForToken(code)

    // Get user information from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user information")
    }

    const user = await userResponse.json()

    // Set the user session
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

    // Return a success page that will close the popup and notify the parent window
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .container { text-align: center; max-width: 500px; padding: 2rem; }
            .success { color: #10b981; margin-bottom: 1rem; }
            .message { margin-bottom: 2rem; color: #4b5563; }
            .user { display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; }
            .avatar { width: 50px; height: 50px; border-radius: 50%; margin-right: 1rem; }
            .name { font-weight: bold; }
          </style>
          <script>
            window.onload = function() {
              window.opener && window.opener.postMessage({ type: 'auth-success', user: ${JSON.stringify(user)} }, window.location.origin);
              setTimeout(function() { window.close(); }, 3000);
            }
          </script>
        </head>
        <body>
          <div class="container">
            <h2 class="success">Authentication Successful</h2>
            <div class="user">
              <img src="${user.avatar_url}" alt="Avatar" class="avatar" />
              <div>
                <div class="name">${user.name || user.login}</div>
                <div class="login">@${user.login}</div>
              </div>
            </div>
            <p class="message">You have successfully authenticated with GitHub.</p>
            <p>This window will close automatically in a few seconds.</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      },
    )
  } catch (error) {
    console.error("Error in GitHub callback:", error)

    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .container { text-align: center; max-width: 500px; padding: 2rem; }
            .error { color: #e11d48; margin-bottom: 1rem; }
            .message { margin-bottom: 2rem; color: #4b5563; }
          </style>
          <script>
            window.onload = function() {
              window.opener && window.opener.postMessage({ type: 'auth-error', error: 'Server error during authentication' }, window.location.origin);
              setTimeout(function() { window.close(); }, 5000);
            }
          </script>
        </head>
        <body>
          <div class="container">
            <h2 class="error">Authentication Failed</h2>
            <p class="message">An error occurred during GitHub authentication.</p>
            <p>This window will close automatically in a few seconds.</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html",
        },
      },
    )
  }
}
