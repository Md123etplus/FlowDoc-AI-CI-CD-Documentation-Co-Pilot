import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ owner: string; repo: string }> }) {
  try {
    const session = await getSession()
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { owner, repo } = await params
    const searchParams = request.nextUrl.searchParams
    const path = searchParams.get("path") || ""

    // Fetch repository contents
    const contentsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!contentsResponse.ok) {
      if (contentsResponse.status === 404) {
        return NextResponse.json({ error: "Path not found" }, { status: 404 })
      }
      throw new Error(`GitHub API error: ${contentsResponse.status}`)
    }

    const contentsData = await contentsResponse.json()

    // If it's a single file, decode the content
    if (!Array.isArray(contentsData) && contentsData.content) {
      try {
        contentsData.decodedContent = Buffer.from(contentsData.content, "base64").toString("utf-8")
      } catch (error) {
        // If decoding fails, it might be a binary file
        contentsData.decodedContent = null
      }
    }

    return NextResponse.json(contentsData)
  } catch (error) {
    console.error("Error fetching repository files:", error)
    return NextResponse.json({ error: "Failed to fetch repository files" }, { status: 500 })
  }
}
