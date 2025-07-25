import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user data")
    }

    const userData = await response.json()
    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error fetching GitHub user:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}
