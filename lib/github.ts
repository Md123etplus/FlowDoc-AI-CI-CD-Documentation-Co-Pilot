export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  owner: {
    login: string
    avatar_url: string
  }
  description: string | null
  private: boolean
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  default_branch: string
}

export interface GitHubFile {
  name: string
  path: string
  content: string
  size: number
  type: string
}

export class GitHubAPI {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async request(url: string) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getUser() {
    return this.request("https://api.github.com/user")
  }

  async getRepositories(page = 1, perPage = 30) {
    return this.request(`https://api.github.com/user/repos?page=${page}&per_page=${perPage}&sort=updated`)
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.request(`https://api.github.com/repos/${owner}/${repo}`)
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<GitHubFile> {
    const data = await this.request(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`)

    return {
      name: data.name,
      path: data.path,
      content: Buffer.from(data.content, "base64").toString("utf-8"),
      size: data.size,
      type: data.type,
    }
  }

  async getWorkflowFiles(owner: string, repo: string): Promise<GitHubFile[]> {
    try {
      const workflows = await this.request(`https://api.github.com/repos/${owner}/${repo}/contents/.github/workflows`)

      if (!Array.isArray(workflows)) {
        return []
      }

      const workflowFiles: GitHubFile[] = []

      // Get up to 3 workflow files
      for (const workflow of workflows.slice(0, 3)) {
        if (workflow.type === "file") {
          try {
            const file = await this.getFileContent(owner, repo, workflow.path)
            workflowFiles.push(file)
          } catch (error) {
            console.error(`Error fetching workflow file ${workflow.path}:`, error)
          }
        }
      }

      return workflowFiles
    } catch (error) {
      console.error("Error fetching workflow files:", error)
      return []
    }
  }

  async getDocumentationFiles(owner: string, repo: string): Promise<GitHubFile[]> {
    const docFiles: GitHubFile[] = []

    // Try to get README
    try {
      const readme = await this.getFileContent(owner, repo, "README.md")
      docFiles.push(readme)
    } catch (error) {
      // Try other README variations
      const readmeVariations = ["readme.md", "README.rst", "readme.rst", "README.txt", "readme.txt"]

      for (const variation of readmeVariations) {
        try {
          const readme = await this.getFileContent(owner, repo, variation)
          docFiles.push(readme)
          break
        } catch (e) {
          // Continue to next variation
        }
      }
    }

    // Try to get docs directory
    try {
      const docs = await this.request(`https://api.github.com/repos/${owner}/${repo}/contents/docs`)

      if (Array.isArray(docs)) {
        // Get up to 2 doc files
        for (const doc of docs.slice(0, 2)) {
          if (doc.type === "file" && (doc.name.endsWith(".md") || doc.name.endsWith(".rst"))) {
            try {
              const file = await this.getFileContent(owner, repo, doc.path)
              docFiles.push(file)
            } catch (error) {
              console.error(`Error fetching doc file ${doc.path}:`, error)
            }
          }
        }
      }
    } catch (error) {
      // Docs directory doesn't exist, that's fine
    }

    return docFiles
  }
}
