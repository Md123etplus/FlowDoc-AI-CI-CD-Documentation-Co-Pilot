import { type NextRequest, NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const perPage = searchParams.get("per_page") || "30"
    const page = searchParams.get("page") || "1"
    const sort = searchParams.get("sort") || "updated"
    const type = searchParams.get("type") || "all"

    const response = await fetch(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=${sort}&type=${type}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch repositories")
    }

    const repositories = await response.json()
    return NextResponse.json(repositories)
  } catch (error) {
    console.error("Error fetching repositories:", error)
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}
