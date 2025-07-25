import { type NextRequest, NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"
import { GitHubAPI } from "@/lib/github"

export async function GET(request: NextRequest, { params }: { params: { owner: string; repo: string } }) {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { owner, repo } = params
    const github = new GitHubAPI(session.accessToken)

    // Get repository details
    const repository = await github.getRepository(owner, repo)

    // Get relevant files
    const [workflowFiles, docFiles] = await Promise.all([
      github.getWorkflowFiles(owner, repo),
      github.getDocumentationFiles(owner, repo),
    ])

    return NextResponse.json({
      repository,
      files: {
        workflows: workflowFiles,
        documentation: docFiles,
      },
    })
  } catch (error) {
    console.error("Error fetching repository data:", error)
    return NextResponse.json({ error: "Failed to fetch repository data" }, { status: 500 })
  }
}
