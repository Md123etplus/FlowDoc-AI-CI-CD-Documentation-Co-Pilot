import { type NextRequest, NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ owner: string; repo: string }> }) {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { owner, repo } = await params
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path") || ""

    // Fetch repository contents
    const contentsUrl = path
      ? `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      : `https://api.github.com/repos/${owner}/${repo}/contents`

    const response = await fetch(contentsUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "FlowDoc-AI",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Path not found" }, { status: 404 })
      }
      console.error("GitHub API error:", response.status, response.statusText)
      return NextResponse.json({ error: "Failed to fetch repository files" }, { status: response.status })
    }

    const contents = await response.json()

    // Ensure we return an array
    const files = Array.isArray(contents) ? contents : [contents]

    return NextResponse.json(files)
  } catch (error) {
    console.error("Repository files API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
