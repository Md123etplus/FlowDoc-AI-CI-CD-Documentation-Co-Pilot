export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  default_branch: string
}

export interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
}

export interface GitHubFile {
  name: string
  path: string
  content: string
  encoding: string
  size: number
}

export class GitHubAPI {
  private baseUrl = "https://api.github.com"

  constructor(private accessToken: string) {}

  async getUser(): Promise<GitHubUser> {
    const response = await fetch(`${this.baseUrl}/user`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    return response.json()
  }

  async getRepositories(): Promise<GitHubRepo[]> {
    const response = await fetch(`${this.baseUrl}/user/repos?sort=updated&per_page=100`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    return response.json()
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    return response.json()
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<GitHubFile | null> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const data = await response.json()

      // Decode base64 content
      if (data.encoding === "base64") {
        data.content = atob(data.content.replace(/\n/g, ""))
      }

      return data
    } catch (error) {
      console.error(`Error fetching file ${path}:`, error)
      return null
    }
  }

  async getDirectoryContents(owner: string, repo: string, path = ""): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) return []
        throw new Error(`GitHub API error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error(`Error fetching directory ${path}:`, error)
      return []
    }
  }

  async getWorkflowFiles(owner: string, repo: string): Promise<GitHubFile[]> {
    const workflowFiles: GitHubFile[] = []

    try {
      const contents = await this.getDirectoryContents(owner, repo, ".github/workflows")

      for (const item of contents) {
        if (item.type === "file" && (item.name.endsWith(".yml") || item.name.endsWith(".yaml"))) {
          const file = await this.getFileContent(owner, repo, item.path)
          if (file) {
            workflowFiles.push(file)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching workflow files:", error)
    }

    return workflowFiles
  }

  async getDocumentationFiles(owner: string, repo: string): Promise<GitHubFile[]> {
    const docFiles: GitHubFile[] = []
    const filesToCheck = [
      "README.md",
      "README.rst",
      "README.txt",
      "CONTRIBUTING.md",
      "LICENSE",
      "LICENSE.md",
      "package.json",
      "requirements.txt",
      "Dockerfile",
      "docker-compose.yml",
    ]

    // Check root files
    for (const filename of filesToCheck) {
      const file = await this.getFileContent(owner, repo, filename)
      if (file) {
        docFiles.push(file)
      }
    }

    // Check docs directory
    try {
      const docsContents = await this.getDirectoryContents(owner, repo, "docs")
      for (const item of docsContents.slice(0, 10)) {
        // Limit to first 10 files
        if (item.type === "file" && (item.name.endsWith(".md") || item.name.endsWith(".rst"))) {
          const file = await this.getFileContent(owner, repo, item.path)
          if (file) {
            docFiles.push(file)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching docs directory:", error)
    }

    return docFiles
  }
}
