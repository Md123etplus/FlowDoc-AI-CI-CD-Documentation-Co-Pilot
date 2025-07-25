import { type NextRequest, NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { owner: string; repo: string } }) {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { owner, repo } = params
    const searchParams = request.nextUrl.searchParams
    const path = searchParams.get("path") || ""

    // Fetch repository contents
    const url = path
      ? `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      : `https://api.github.com/repos/${owner}/${repo}/contents`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Path not found" }, { status: 404 })
      }
      throw new Error("Failed to fetch repository files")
    }

    const files = await response.json()
    return NextResponse.json(files)
  } catch (error) {
    console.error("Error fetching repository files:", error)
    return NextResponse.json({ error: "Failed to fetch repository files" }, { status: 500 })
  }
}
