import { type NextRequest, NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const perPage = searchParams.get("per_page") || "30"

    const response = await fetch(
      `https://api.github.com/user/repos?page=${page}&per_page=${perPage}&sort=updated&affiliation=owner,collaborator`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "FlowDoc-AI",
        },
      },
    )

    if (!response.ok) {
      console.error("GitHub API error:", response.status, response.statusText)
      return NextResponse.json({ error: "Failed to fetch repositories" }, { status: response.status })
    }

    const repositories = await response.json()
    return NextResponse.json(repositories)
  } catch (error) {
    console.error("GitHub repositories API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
