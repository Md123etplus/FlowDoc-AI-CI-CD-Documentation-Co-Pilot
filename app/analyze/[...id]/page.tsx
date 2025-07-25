import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, GitFork, Eye, EyeOff, Calendar, FileText, Folder, ExternalLink } from "lucide-react"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
  default_branch: string
}

interface FileItem {
  name: string
  path: string
  type: "file" | "dir"
  size?: number
  download_url?: string
}

async function getRepository(owner: string, repo: string): Promise<Repository | null> {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/github/repositories/${owner}/${repo}`,
      {
        cache: "no-store",
      },
    )

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching repository:", error)
    return null
  }
}

async function getRepositoryFiles(owner: string, repo: string, path = ""): Promise<FileItem[]> {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/github/repositories/${owner}/${repo}/files?path=${path}`,
      {
        cache: "no-store",
      },
    )

    if (!response.ok) {
      return []
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching repository files:", error)
    return []
  }
}

function RepositoryInfo({ repository }: { repository: Repository }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold">{repository.name}</CardTitle>
            <CardDescription className="mt-2">{repository.description || "No description available"}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={repository.private ? "secondary" : "default"}>
              {repository.private ? (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Private
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Public
                </>
              )}
            </Badge>
            {repository.language && <Badge variant="outline">{repository.language}</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {repository.stargazers_count}
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="w-4 h-4" />
              {repository.forks_count}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Updated {new Date(repository.updated_at).toLocaleDateString()}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on GitHub
            </a>
          </Button>
          <Button variant="outline">Generate CI/CD Pipeline</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function FileExplorer({ files }: { files: FileItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Repository Files</CardTitle>
        <CardDescription>Explore the repository structure</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.path} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted">
              {file.type === "dir" ? (
                <Folder className="w-4 h-4 text-blue-500" />
              ) : (
                <FileText className="w-4 h-4 text-gray-500" />
              )}
              <span className="flex-1">{file.name}</span>
              {file.size && <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default async function AnalyzePage({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = await params

  if (!id || id.length !== 2) {
    notFound()
  }

  const [owner, repo] = id

  if (!owner || !repo) {
    notFound()
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AnalyzeContent owner={owner} repo={repo} />
    </Suspense>
  )
}

async function AnalyzeContent({ owner, repo }: { owner: string; repo: string }) {
  const [repository, files] = await Promise.all([getRepository(owner, repo), getRepositoryFiles(owner, repo)])

  if (!repository) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Repository Not Found</CardTitle>
            <CardDescription>
              The repository {owner}/{repo} could not be found or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <a href="/dashboard">Back to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <RepositoryInfo repository={repository} />
        <FileExplorer files={files} />
      </div>
    </div>
  )
}
