import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"
import { GitHubAPI } from "@/lib/github"

export async function GET(request: Request, { params }: { params: { owner: string; repo: string } }) {
  try {
    const session = await getUserSession()

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { owner, repo } = params
    const github = new GitHubAPI(session.accessToken)

    // Fetch repository details
    const repository = await github.getRepository(owner, repo)

    // Fetch workflow files
    const workflowFiles = await github.getWorkflowFiles(owner, repo)

    // Fetch documentation files
    const documentationFiles = await github.getDocumentationFiles(owner, repo)

    return NextResponse.json({
      repository,
      files: {
        workflows: workflowFiles,
        documentation: documentationFiles,
      },
    })
  } catch (error) {
    console.error("Error fetching repository:", error)
    return NextResponse.json({ error: "Failed to fetch repository" }, { status: 500 })
  }
}
