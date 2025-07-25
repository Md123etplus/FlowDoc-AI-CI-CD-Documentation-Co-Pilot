"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  Github,
  Star,
  GitFork,
  Eye,
  Calendar,
  FileCode,
  Folder,
  File,
  Loader2,
  AlertCircle,
} from "lucide-react"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  language: string | null
  languages: Record<string, number>
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
  default_branch: string
  topics: string[]
  visibility: string
  owner: {
    login: string
    avatar_url: string
  }
}

interface FileItem {
  name: string
  path: string
  type: "file" | "dir"
  size?: number
  download_url?: string
  content?: string
}

export default function AnalyzePage() {
  const params = useParams()
  const router = useRouter()
  const [repository, setRepository] = useState<Repository | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState("")

  // Parse the repository ID (format: owner/repo)
  const repoId = params.id as string
  const [owner, repo] = repoId ? repoId.split("/") : ["", ""]

  useEffect(() => {
    if (!owner || !repo) {
      setError("Invalid repository format")
      setLoading(false)
      return
    }

    fetchRepositoryData()
  }, [owner, repo])

  const fetchRepositoryData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch repository details
      const repoResponse = await fetch(`/api/github/repositories/${owner}/${repo}`)

      if (!repoResponse.ok) {
        if (repoResponse.status === 404) {
          throw new Error("Repository not found")
        }
        throw new Error("Failed to fetch repository details")
      }

      const repoData = await repoResponse.json()
      setRepository(repoData)

      // Fetch repository files
      await fetchFiles("")
    } catch (error) {
      console.error("Error fetching repository data:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch repository data")
    } finally {
      setLoading(false)
    }
  }

  const fetchFiles = async (path: string) => {
    try {
      const filesResponse = await fetch(
        `/api/github/repositories/${owner}/${repo}/files?path=${encodeURIComponent(path)}`,
      )

      if (!filesResponse.ok) {
        throw new Error("Failed to fetch repository files")
      }

      const filesData = await filesResponse.json()
      setFiles(Array.isArray(filesData) ? filesData : [])
      setCurrentPath(path)
    } catch (error) {
      console.error("Error fetching files:", error)
      setFiles([])
    }
  }

  const handleFileClick = (file: FileItem) => {
    if (file.type === "dir") {
      fetchFiles(file.path)
    }
  }

  const handleBreadcrumbClick = (path: string) => {
    fetchFiles(path)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      JavaScript: "#f1e05a",
      TypeScript: "#2b7489",
      Python: "#3572A5",
      Java: "#b07219",
      "C++": "#f34b7d",
      C: "#555555",
      "C#": "#239120",
      PHP: "#4F5D95",
      Ruby: "#701516",
      Go: "#00ADD8",
      Rust: "#dea584",
      Swift: "#ffac45",
      Kotlin: "#F18E33",
      Dart: "#00B4AB",
      HTML: "#e34c26",
      CSS: "#1572B6",
      Shell: "#89e051",
    }
    return colors[language] || "#858585"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading repository data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/dashboard")} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button onClick={fetchRepositoryData}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!repository) {
    return null
  }

  const breadcrumbs = currentPath
    ? currentPath.split("/").reduce(
        (acc, part, index, array) => {
          const path = array.slice(0, index + 1).join("/")
          acc.push({ name: part, path })
          return acc
        },
        [] as { name: string; path: string }[],
      )
    : []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button asChild>
            <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-2" />
              View on GitHub
            </a>
          </Button>
        </div>

        {/* Repository Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{repository.full_name}</CardTitle>
                <CardDescription className="mt-2">
                  {repository.description || "No description available"}
                </CardDescription>
              </div>
              <Badge variant={repository.visibility === "private" ? "secondary" : "default"}>
                {repository.visibility}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {repository.stargazers_count}
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                {repository.forks_count}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {repository.watchers_count}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Updated {new Date(repository.updated_at).toLocaleDateString()}
              </div>
              {repository.language && (
                <div className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getLanguageColor(repository.language) }}
                  />
                  {repository.language}
                </div>
              )}
            </div>

            {repository.topics && repository.topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {repository.topics.map((topic) => (
                  <Badge key={topic} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Tabs */}
        <Tabs defaultValue="files" className="space-y-4">
          <TabsList>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="cicd">CI/CD Analysis</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Repository Files</CardTitle>
                <CardDescription>Browse the repository structure and files</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Breadcrumbs */}
                {currentPath && (
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <Button variant="ghost" size="sm" onClick={() => handleBreadcrumbClick("")}>
                      {repository.name}
                    </Button>
                    {breadcrumbs.map((crumb, index) => (
                      <div key={crumb.path} className="flex items-center gap-2">
                        <span>/</span>
                        <Button variant="ghost" size="sm" onClick={() => handleBreadcrumbClick(crumb.path)}>
                          {crumb.name}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.path}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => handleFileClick(file)}
                      >
                        {file.type === "dir" ? (
                          <Folder className="h-4 w-4 text-blue-500" />
                        ) : (
                          <File className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="flex-1">{file.name}</span>
                        {file.size && (
                          <span className="text-sm text-muted-foreground">{formatFileSize(file.size)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="languages">
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
                <CardDescription>Programming languages used in this repository</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(repository.languages || {}).map(([language, bytes]) => {
                    const total = Object.values(repository.languages || {}).reduce((a, b) => a + b, 0)
                    const percentage = ((bytes / total) * 100).toFixed(1)

                    return (
                      <div key={language} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getLanguageColor(language) }}
                            />
                            <span>{language}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              backgroundColor: getLanguageColor(language),
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cicd">
            <Card>
              <CardHeader>
                <CardTitle>CI/CD Analysis</CardTitle>
                <CardDescription>AI-powered analysis and recommendations for CI/CD pipelines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    CI/CD analysis will be available soon. This feature will analyze your repository and generate
                    optimized GitHub Actions workflows.
                  </p>
                  <Button disabled>Generate CI/CD Pipeline</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs">
            <Card>
              <CardHeader>
                <CardTitle>Documentation Analysis</CardTitle>
                <CardDescription>AI-powered documentation generation and enhancement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Documentation analysis will be available soon. This feature will analyze your repository and
                    generate comprehensive documentation.
                  </p>
                  <Button disabled>Generate Documentation</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
