"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Star, GitFork, Eye, Code, FileText, Folder, ExternalLink, AlertCircle, Loader2 } from "lucide-react"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  language: string | null
  languages: Record<string, number>
  topics: string[]
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
  default_branch: string
  owner: {
    login: string
    avatar_url: string
    html_url: string
  }
}

interface FileItem {
  name: string
  path: string
  type: "file" | "dir"
  size?: number
  download_url?: string
}

interface AnalyzePageProps {
  params: Promise<{ id: string[] }>
}

export default function AnalyzePage({ params }: AnalyzePageProps) {
  const router = useRouter()
  const [repository, setRepository] = useState<Repository | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filesLoading, setFilesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [repoId, setRepoId] = useState<string>("")

  useEffect(() => {
    async function getRepoId() {
      const resolvedParams = await params
      const id = resolvedParams.id.join("/")
      setRepoId(id)
    }
    getRepoId()
  }, [params])

  useEffect(() => {
    if (!repoId) return

    async function fetchRepositoryData() {
      try {
        setLoading(true)
        setError(null)

        // Validate repository ID format
        if (!repoId.includes("/")) {
          throw new Error("Invalid repository format. Expected format: owner/repo")
        }

        const [owner, repo] = repoId.split("/")
        if (!owner || !repo) {
          throw new Error("Invalid repository format. Expected format: owner/repo")
        }

        // Check authentication
        const sessionResponse = await fetch("/api/auth/session")
        const sessionData = await sessionResponse.json()

        if (!sessionData.authenticated) {
          router.push("/")
          return
        }

        // Fetch repository details
        const repoResponse = await fetch(`/api/github/repositories/${owner}/${repo}`)

        if (!repoResponse.ok) {
          if (repoResponse.status === 404) {
            throw new Error("Repository not found. Please check if the repository exists and you have access to it.")
          } else if (repoResponse.status === 401) {
            throw new Error("Unauthorized. Please log in again.")
          } else {
            throw new Error("Failed to fetch repository data")
          }
        }

        const repoData = await repoResponse.json()
        setRepository(repoData)

        // Fetch repository files
        setFilesLoading(true)
        const filesResponse = await fetch(`/api/github/repositories/${owner}/${repo}/files`)

        if (filesResponse.ok) {
          const filesData = await filesResponse.json()
          setFiles(Array.isArray(filesData) ? filesData : [])
        }

        setFilesLoading(false)
      } catch (error) {
        console.error("Error fetching repository:", error)
        setError(error instanceof Error ? error.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchRepositoryData()
  }, [repoId, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-8 w-96 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-base">
            <strong>Error:</strong> {error}
            <br />
            Please check if the repository exists and you have access to it.
          </AlertDescription>
        </Alert>

        <div className="mt-6 text-center">
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (!repository) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading repository...</p>
        </div>
      </div>
    )
  }

  const totalLanguageBytes = Object.values(repository.languages).reduce((sum, bytes) => sum + bytes, 0)
  const languagePercentages = Object.entries(repository.languages)
    .map(([lang, bytes]) => ({
      language: lang,
      percentage: ((bytes / totalLanguageBytes) * 100).toFixed(1),
    }))
    .sort((a, b) => Number.parseFloat(b.percentage) - Number.parseFloat(a.percentage))

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{repository.full_name}</h1>
            {repository.description && <p className="text-muted-foreground text-lg mb-4">{repository.description}</p>}

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1" />
                {repository.stargazers_count.toLocaleString()}
              </div>
              <div className="flex items-center">
                <GitFork className="w-4 h-4 mr-1" />
                {repository.forks_count.toLocaleString()}
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {repository.watchers_count.toLocaleString()}
              </div>
              <Badge variant={repository.private ? "secondary" : "outline"}>
                {repository.private ? "Private" : "Public"}
              </Badge>
            </div>
          </div>

          <Button asChild>
            <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on GitHub
            </a>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Repository Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Folder className="w-5 h-5 mr-2" />
                Repository Files
              </CardTitle>
              <CardDescription>Explore the repository structure and files</CardDescription>
            </CardHeader>
            <CardContent>
              {filesLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : files.length > 0 ? (
                <div className="space-y-1">
                  {files.slice(0, 10).map((file) => (
                    <div key={file.path} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                      <div className="flex items-center">
                        {file.type === "dir" ? (
                          <Folder className="w-4 h-4 mr-2 text-blue-500" />
                        ) : (
                          <FileText className="w-4 h-4 mr-2 text-gray-500" />
                        )}
                        <span className="text-sm">{file.name}</span>
                      </div>
                      {file.size && (
                        <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                      )}
                    </div>
                  ))}
                  {files.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      ... and {files.length - 10} more files
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No files found</p>
              )}
            </CardContent>
          </Card>

          {/* CI/CD Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2" />
                CI/CD Pipeline Generation
              </CardTitle>
              <CardDescription>Generate optimized CI/CD workflows for this repository</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Based on the repository analysis, we can generate customized CI/CD pipelines including testing,
                  building, and deployment workflows.
                </p>
                <Button className="w-full" disabled>
                  <Code className="w-4 h-4 mr-2" />
                  Generate CI/CD Pipeline (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Repository Info */}
          <Card>
            <CardHeader>
              <CardTitle>Repository Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Owner</h4>
                <div className="flex items-center space-x-2">
                  <img
                    src={repository.owner.avatar_url || "/placeholder.svg"}
                    alt={repository.owner.login}
                    className="w-6 h-6 rounded-full"
                  />
                  <a
                    href={repository.owner.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {repository.owner.login}
                  </a>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Default branch:</span>
                    <Badge variant="outline">{repository.default_branch}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span>{(repository.size / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(repository.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated:</span>
                    <span>{new Date(repository.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {repository.topics.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2">Topics</h4>
                    <div className="flex flex-wrap gap-1">
                      {repository.topics.map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Languages */}
          {languagePercentages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {languagePercentages.slice(0, 5).map(({ language, percentage }) => (
                    <div key={language}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{language}</span>
                        <span className="text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
