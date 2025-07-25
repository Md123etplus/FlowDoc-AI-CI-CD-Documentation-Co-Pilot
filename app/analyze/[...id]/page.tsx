"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Star, GitFork, Eye, EyeOff, Calendar, FileText, Code, Settings } from "lucide-react"

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
  languages: Record<string, number>
  contents: Array<{
    name: string
    path: string
    type: "file" | "dir"
    size?: number
  }>
}

export default function AnalyzePage() {
  const params = useParams()
  const router = useRouter()
  const [repository, setRepository] = useState<Repository | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Handle both formats: [...id] for owner/repo and [id] for single segment
  const repositoryId = Array.isArray(params.id) ? params.id.join("/") : (params.id as string)

  useEffect(() => {
    async function fetchRepositoryData() {
      if (!repositoryId) return

      try {
        setLoading(true)
        setError(null)

        // Parse owner/repo from the ID
        const parts = repositoryId.split("/")
        if (parts.length !== 2) {
          throw new Error("Invalid repository format. Expected format: owner/repo")
        }

        const [owner, repo] = parts
        if (!owner || !repo) {
          throw new Error("Invalid repository format. Expected format: owner/repo")
        }

        const response = await fetch(`/api/github/repositories/${owner}/${repo}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Repository not found")
          }
          if (response.status === 401) {
            throw new Error("Authentication required. Please log in again.")
          }
          throw new Error("Failed to fetch repository details")
        }

        const repoData = await response.json()
        setRepository(repoData)
      } catch (err) {
        console.error("Error fetching repository:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchRepositoryData()
  }, [repositoryId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please check if the repository exists and you have access to it.</p>
            <div className="mt-4">
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!repository) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Repository Not Found</CardTitle>
            <CardDescription>The requested repository could not be found.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const totalLanguageBytes = Object.values(repository.languages || {}).reduce((sum, bytes) => sum + bytes, 0)
  const languagePercentages = Object.entries(repository.languages || {}).map(([language, bytes]) => ({
    language,
    percentage: totalLanguageBytes > 0 ? ((bytes / totalLanguageBytes) * 100).toFixed(1) : "0",
  }))

  const configFiles = (repository.contents || []).filter(
    (file) =>
      file.type === "file" &&
      (file.name.includes("config") ||
        file.name.includes("package.json") ||
        file.name.includes("requirements.txt") ||
        file.name.includes("Dockerfile") ||
        file.name.includes(".yml") ||
        file.name.includes(".yaml") ||
        file.name.includes("Jenkinsfile") ||
        file.name.includes(".github")),
  )

  const documentationFiles = (repository.contents || []).filter(
    (file) =>
      file.type === "file" &&
      (file.name.toLowerCase().includes("readme") ||
        file.name.toLowerCase().includes("doc") ||
        file.name.toLowerCase().includes("changelog") ||
        file.name.toLowerCase().includes("license")),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Repository Info */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{repository.name}</h1>
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
        </div>
        {repository.description && <p className="text-muted-foreground text-lg mb-4">{repository.description}</p>}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            {repository.stargazers_count}
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="w-4 h-4" />
            {repository.forks_count}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Updated {new Date(repository.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Analysis Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Languages
            </CardTitle>
            <CardDescription>Programming languages used in this repository</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {languagePercentages.length > 0 ? (
                languagePercentages.slice(0, 5).map(({ language, percentage }) => (
                  <div key={language} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{language}</span>
                    <span className="text-sm text-muted-foreground">{percentage}%</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No language data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </CardTitle>
            <CardDescription>Configuration and build files detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {configFiles.length > 0 ? (
                configFiles.slice(0, 5).map((file) => (
                  <div key={file.path} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No configuration files detected</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentation
            </CardTitle>
            <CardDescription>Documentation files found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documentationFiles.length > 0 ? (
                documentationFiles.map((file) => (
                  <div key={file.path} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No documentation files found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Repository Structure */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Repository Structure</CardTitle>
            <CardDescription>Files and directories in the root of this repository</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {(repository.contents || []).map((item) => (
                <div key={item.path} className="flex items-center gap-2 p-2 rounded border">
                  <div className={`w-2 h-2 rounded-full ${item.type === "dir" ? "bg-yellow-500" : "bg-gray-500"}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.type === "dir" && <span className="text-xs text-muted-foreground ml-auto">Directory</span>}
                  {item.type === "file" && item.size && (
                    <span className="text-xs text-muted-foreground ml-auto">{(item.size / 1024).toFixed(1)} KB</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </Button>
        <Button variant="outline">Generate CI/CD Pipeline</Button>
        <Button variant="outline">Generate Documentation</Button>
      </div>
    </div>
  )
}
