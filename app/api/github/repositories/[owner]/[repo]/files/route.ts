import { type NextRequest, NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ owner: string; repo: string }> }) {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { owner, repo } = await params
    const searchParams = request.nextUrl.searchParams
    const path = searchParams.get("path") || ""

    // Fetch repository contents
    const contentsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "FlowDoc-AI",
      },
    })

    if (!contentsResponse.ok) {
      if (contentsResponse.status === 404) {
        return NextResponse.json({ error: "Path not found" }, { status: 404 })
      }
      throw new Error(`GitHub API error: ${contentsResponse.status}`)
    }

    const contents = await contentsResponse.json()
    return NextResponse.json(contents)
  } catch (error) {
    console.error("Repository files API error:", error)
    return NextResponse.json({ error: "Failed to fetch repository files" }, { status: 500 })
  }
}
