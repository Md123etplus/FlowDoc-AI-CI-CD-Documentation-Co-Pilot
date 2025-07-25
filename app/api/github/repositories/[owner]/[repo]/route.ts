import { type NextRequest, NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { owner: string; repo: string } }) {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { owner, repo } = params

    // Fetch repository details
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return NextResponse.json({ error: "Repository not found" }, { status: 404 })
      }
      throw new Error("Failed to fetch repository details")
    }

    const repoData = await repoResponse.json()

    // Fetch repository languages
    const languagesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    let languages = {}
    if (languagesResponse.ok) {
      languages = await languagesResponse.json()
    }

    return NextResponse.json({
      ...repoData,
      languages,
    })
  } catch (error) {
    console.error("GitHub repository API error:", error)
    return NextResponse.json({ error: "Failed to fetch repository details" }, { status: 500 })
  }
}
