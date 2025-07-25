import { type NextRequest, NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ owner: string; repo: string }> }) {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { owner, repo } = await params

    // Fetch repository details
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "FlowDoc-AI",
      },
    })

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return NextResponse.json({ error: "Repository not found" }, { status: 404 })
      }
      throw new Error(`GitHub API error: ${repoResponse.status}`)
    }

    const repository = await repoResponse.json()
    return NextResponse.json(repository)
  } catch (error) {
    console.error("Repository API error:", error)
    return NextResponse.json({ error: "Failed to fetch repository" }, { status: 500 })
  }
}
