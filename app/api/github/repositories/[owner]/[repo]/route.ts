import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ owner: string; repo: string }> }) {
  try {
    const session = await getSession()
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { owner, repo } = await params

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
      throw new Error(`GitHub API error: ${repoResponse.status}`)
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

    // Fetch repository topics
    const topicsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/topics`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.mercy-preview+json",
      },
    })

    let topics = []
    if (topicsResponse.ok) {
      const topicsData = await topicsResponse.json()
      topics = topicsData.names || []
    }

    // Combine all data
    const repositoryData = {
      ...repoData,
      languages,
      topics,
    }

    return NextResponse.json(repositoryData)
  } catch (error) {
    console.error("Error fetching repository:", error)
    return NextResponse.json({ error: "Failed to fetch repository data" }, { status: 500 })
  }
}
