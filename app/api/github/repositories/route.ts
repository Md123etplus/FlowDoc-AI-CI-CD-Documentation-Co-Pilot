import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"
import { GitHubAPI } from "@/lib/github"

export async function GET() {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const github = new GitHubAPI(session.accessToken)
    const repositories = await github.getRepositories()

    return NextResponse.json(repositories)
  } catch (error) {
    console.error("Error fetching repositories:", error)
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}
