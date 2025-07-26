"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DocumentationPreviewModal } from "@/components/documentation-preview-modal"
import {
  ArrowLeft,
  Star,
  GitFork,
  Eye,
  EyeOff,
  FileText,
  Folder,
  Code,
  Settings,
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react"

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

export default function AnalyzePage() {
  const params = useParams()
  const router = useRouter()
  const [repository, setRepository] = useState<Repository | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filesLoading, setFilesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [showDocModal, setShowDocModal] = useState(false)

  // Parse repository ID from URL segments
  const repositoryId = Array.isArray(params.id) ? params.id.join("/") : params.id

  useEffect(() => {
    checkAuthentication()
  }, [])

  useEffect(() => {
    if (isAuthenticated && repositoryId) {
      fetchRepositoryData()
    } else if (isAuthenticated === false) {
      router.push("/")
    }
  }, [isAuthenticated, repositoryId, router])

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/auth/session")
      const data = await response.json()
      setIsAuthenticated(data.authenticated || false)
    } catch (error) {
      console.error("Error checking authentication:", error)
      setIsAuthenticated(false)
    }
  }

  const fetchRepositoryData = async () => {
    if (!repositoryId) {
      setError("Invalid repository format. Expected format: owner/repo")
      setLoading(false)
      return
    }

    // Validate repository ID format
    const parts = repositoryId.split("/")
    if (parts.length !== 2) {
      setError("Invalid repository format. Expected format: owner/repo")
      setLoading(false)
      return
    }

    const [owner, repo] = parts

    try {
      setLoading(true)
      setError(null)

      // Fetch repository details
      const repoResponse = await fetch(`/api/github/repositories/${owner}/${repo}`)

      if (!repoResponse.ok) {
        if (repoResponse.status === 401) {
          setIsAuthenticated(false)
          return
        }
        if (repoResponse.status === 404) {
          throw new Error("Repository not found. Please check if the repository exists and you have access to it.")
        }
        throw new Error("Failed to fetch repository details")
      }

      const repoData = await repoResponse.json()
      setRepository(repoData)

      // Fetch repository files
      setFilesLoading(true)
      try {
        const filesResponse = await fetch(`/api/github/repositories/${owner}/${repo}/files`)
        if (filesResponse.ok) {
          const filesData = await filesResponse.json()
          setFiles(Array.isArray(filesData) ? filesData : [])
        }
      } catch (filesError) {
        console.warn("Failed to fetch repository files:", filesError)
      } finally {
        setFilesLoading(false)
      }
    } catch (err) {
      console.error("Error fetching repository:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show loading while fetching repository
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
          </AlertDescription>
        </Alert>

        <div className="mt-6 flex gap-4">
          <Button onClick={fetchRepositoryData} variant="outline">
            Try Again
          </Button>
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
          {/* Repository Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Repository Overview
              </CardTitle>
              <CardDescription>Basic information about this repository</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Owner:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <img
                      src={repository.owner.avatar_url || "/placeholder.svg"}
                      alt={repository.owner.login}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="font-medium">{repository.owner.login}</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Language:</span>
                  <p className="font-medium mt-1">{repository.language || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Default Branch:</span>
                  <p className="font-medium mt-1">{repository.default_branch}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <p className="font-medium mt-1">{(repository.size / 1024).toFixed(1)} MB</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium mt-1">{new Date(repository.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <p className="font-medium mt-1">{new Date(repository.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                <ScrollArea className="h-64">
                  <div className="space-y-1">
                    {files.map((file) => (
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
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No files found or unable to access repository contents.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Repository Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Stars</span>
                  </div>
                  <span className="font-semibold">{repository.stargazers_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitFork className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Forks</span>
                  </div>
                  <span className="font-semibold">{repository.forks_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Watchers</span>
                  </div>
                  <span className="font-semibold">{repository.watchers_count.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                AI Generation
              </CardTitle>
              <CardDescription>Generate automated content for this repository</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" disabled>
                <Code className="w-4 h-4 mr-2" />
                Generate CI/CD Pipeline
                <Badge variant="secondary" className="ml-2">
                  Coming Soon
                </Badge>
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowDocModal(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Generate Documentation
              </Button>
              <p className="text-xs text-muted-foreground">
                AI-powered content generation based on your repository structure and technologies.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Documentation Preview Modal */}
      <DocumentationPreviewModal
        isOpen={showDocModal}
        onOpenChange={setShowDocModal}
        repositoryId={repositoryId || ""}
      />
    </div>
  )
}
