import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  // Clear the session cookie
  cookies().delete("github_session")

  // Redirect to home page
  return NextResponse.json({ success: true })
}
