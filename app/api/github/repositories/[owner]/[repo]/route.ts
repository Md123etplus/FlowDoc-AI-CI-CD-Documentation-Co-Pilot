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
      return NextResponse.json({ error: "Failed to fetch repository" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      owner: {
        login: data.owner.login,
        avatarUrl: data.owner.avatar_url,
      },
      description: data.description,
      defaultBranch: data.default_branch,
      language: data.language,
      stargazersCount: data.stargazers_count,
      forksCount: data.forks_count,
      updatedAt: data.updated_at,
      visibility: data.visibility,
    })
  } catch (error) {
    console.error("Error fetching repository:", error)
    return NextResponse.json({ error: "Failed to fetch repository" }, { status: 500 })
  }
}
