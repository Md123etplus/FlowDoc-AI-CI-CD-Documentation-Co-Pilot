import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { owner: string; repo: string } }) {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { owner, repo } = params

    // Fetch repository contents
    const contentsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!contentsResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch repository contents" }, { status: contentsResponse.status })
    }

    const contents = await contentsResponse.json()

    // Find relevant files (README, workflows, docs)
    const relevantFiles = []

    // Check for README
    const readmeFile = contents.find((item: any) => item.type === "file" && item.name.toLowerCase().includes("readme"))

    if (readmeFile) {
      const fileResponse = await fetch(readmeFile.url, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (fileResponse.ok) {
        const fileData = await fileResponse.json()
        relevantFiles.push({
          name: fileData.name,
          path: fileData.path,
          content: Buffer.from(fileData.content, "base64").toString("utf-8"),
          type: "file",
        })
      }
    }

    // Check for GitHub workflows
    const workflowsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/.github/workflows`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (workflowsResponse.ok) {
      const workflows = await workflowsResponse.json()

      // Only get up to 2 workflow files to avoid too many requests
      const workflowFiles = Array.isArray(workflows) ? workflows.slice(0, 2) : []

      for (const workflow of workflowFiles) {
        if (workflow.type === "file") {
          const fileResponse = await fetch(workflow.url, {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          })

          if (fileResponse.ok) {
            const fileData = await fileResponse.json()
            relevantFiles.push({
              name: fileData.name,
              path: fileData.path,
              content: Buffer.from(fileData.content, "base64").toString("utf-8"),
              type: "file",
            })
          }
        }
      }
    }

    // Check for docs directory
    const docsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/docs`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (docsResponse.ok) {
      const docs = await docsResponse.json()

      // Only get up to 2 doc files to avoid too many requests
      const docFiles = Array.isArray(docs) ? docs.slice(0, 2) : []

      for (const doc of docFiles) {
        if (doc.type === "file") {
          const fileResponse = await fetch(doc.url, {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          })

          if (fileResponse.ok) {
            const fileData = await fileResponse.json()
            relevantFiles.push({
              name: fileData.name,
              path: fileData.path,
              content: Buffer.from(fileData.content, "base64").toString("utf-8"),
              type: "file",
            })
          }
        }
      }
    }

    // If we don't have enough files, get some from the root
    if (relevantFiles.length < 4) {
      const rootFiles = contents.filter((item: any) => item.type === "file").slice(0, 4 - relevantFiles.length)

      for (const file of rootFiles) {
        const fileResponse = await fetch(file.url, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        })

        if (fileResponse.ok) {
          const fileData = await fileResponse.json()
          relevantFiles.push({
            name: fileData.name,
            path: fileData.path,
            content: Buffer.from(fileData.content, "base64").toString("utf-8"),
            type: "file",
          })
        }
      }
    }

    return NextResponse.json(relevantFiles)
  } catch (error) {
    console.error("Error fetching repository files:", error)
    return NextResponse.json({ error: "Failed to fetch repository files" }, { status: 500 })
  }
}
