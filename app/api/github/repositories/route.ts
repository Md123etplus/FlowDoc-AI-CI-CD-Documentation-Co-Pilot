import { type NextRequest, NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"
import { GitHubAPI } from "@/lib/github"

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const perPage = Number.parseInt(searchParams.get("per_page") || "30")

    const github = new GitHubAPI(session.accessToken)
    const repositories = await github.getRepositories(page, perPage)

    return NextResponse.json(repositories)
  } catch (error) {
    console.error("Error fetching repositories:", error)
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}
