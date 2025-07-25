import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { owner: string; repo: string } }) {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { owner, repo } = params
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path") || ""

    // Fetch directory contents or file content
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json([])
      }
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const data = await response.json()

    // If it's a single file, return file content
    if (!Array.isArray(data)) {
      const fileContent = {
        name: data.name,
        path: data.path,
        type: "file",
        size: data.size,
        content: data.content ? Buffer.from(data.content, "base64").toString("utf-8") : null,
      }
      return NextResponse.json([fileContent])
    }

    // If it's a directory, return directory contents
    const files = data.map((item: any) => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
      download_url: item.download_url,
    }))

    return NextResponse.json(files)
  } catch (error) {
    console.error("Error fetching repository files:", error)
    return NextResponse.json({ error: "Failed to fetch repository files" }, { status: 500 })
  }
}
