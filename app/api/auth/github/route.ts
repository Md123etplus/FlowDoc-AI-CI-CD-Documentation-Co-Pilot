import { NextResponse } from "next/server"
import { getAuthorizationUrl } from "@/lib/auth"

export async function GET() {
  try {
    const authUrl = getAuthorizationUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("GitHub OAuth error:", error)
    // Redirect to an error page or show an error message
    return NextResponse.redirect(
      new URL(
        "/auth/error?message=Missing+GitHub+OAuth+configuration",
        process.env.NEXTAUTH_URL || "http://localhost:3000",
      ),
    )
  }
}
