import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { owner: string; repo: string } }) {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { owner, repo } = params

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Repository not found" }, { status: 404 })
      }
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const repoData = await response.json()

    // Also fetch languages
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
    console.error("Error fetching repository:", error)
    return NextResponse.json({ error: "Failed to fetch repository" }, { status: 500 })
  }
}
