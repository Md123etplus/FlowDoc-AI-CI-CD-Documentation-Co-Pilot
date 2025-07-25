"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Github, Star, GitFork, Eye, EyeOff, Calendar, FileText, Code, AlertCircle, ArrowLeft } from "lucide-react"

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

interface RepositoryFile {
  name: string
  path: string
  type: "file" | "dir"
  size?: number
}

export default function AnalyzePage() {
  const params = useParams()
  const router = useRouter()
  const [repository, setRepository] = useState<Repository | null>(null)
  const [files, setFiles] = useState<RepositoryFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Parse repository ID from URL segments
  const repositoryId = Array.isArray(params.id) ? params.id.join("/") : params.id

  useEffect(() => {
    if (repositoryId) {
      fetchRepositoryData()
    }
  }, [repositoryId])

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
          router.push("/")
          return
        }
        if (repoResponse.status === 404) {
          throw new Error("Repository not found or you don't have access to it")
        }
        throw new Error("Failed to fetch repository details")
      }

      const repoData = await repoResponse.json()
      setRepository(repoData)

      // Fetch repository files
      const filesResponse = await fetch(`/api/github/repositories/${owner}/${repo}/files`)

      if (filesResponse.ok) {
        const filesData = await filesResponse.json()
        setFiles(filesData)
      } else {
        console.warn("Failed to fetch repository files")
      }
    } catch (err) {
      console.error("Error fetching repository data:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">Error</AlertDescription>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Please check if the repository exists and you have access to it.
          </p>
          <div className="flex gap-2">
            <Button onClick={fetchRepositoryData} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => router.push("/dashboard")} variant="default">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!repository) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Repository not found or you don't have access to it.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{repository.name}</h1>
            <p className="text-muted-foreground mb-4">{repository.description || "No description available"}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
      </div>

      {/* Analysis Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Repository Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              Repository Overview
            </CardTitle>
            <CardDescription>Basic information about this repository</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="font-mono">{repository.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Default Branch:</span>
                <span className="font-mono">{repository.default_branch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language:</span>
                <span>{repository.language || "Not specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visibility:</span>
                <span>{repository.private ? "Private" : "Public"}</span>
              </div>
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  View on GitHub
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              File Structure
            </CardTitle>
            <CardDescription>Repository files and directories</CardDescription>
          </CardHeader>
          <CardContent>
            {files.length > 0 ? (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {files.slice(0, 10).map((file) => (
                  <div key={file.path} className="flex items-center gap-2 text-sm">
                    {file.type === "dir" ? (
                      <FileText className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Code className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="font-mono text-xs">{file.name}</span>
                  </div>
                ))}
                {files.length > 10 && (
                  <div className="text-xs text-muted-foreground">... and {files.length - 10} more files</div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No files found or unable to access repository contents.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis & Generation</CardTitle>
            <CardDescription>Generate CI/CD pipelines and documentation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" disabled>
              <Code className="w-4 h-4 mr-2" />
              Generate CI/CD Pipeline
              <Badge variant="secondary" className="ml-2">
                Coming Soon
              </Badge>
            </Button>
            <Button variant="outline" className="w-full bg-transparent" disabled>
              <FileText className="w-4 h-4 mr-2" />
              Generate Documentation
              <Badge variant="secondary" className="ml-2">
                Coming Soon
              </Badge>
            </Button>
            <Button variant="outline" className="w-full bg-transparent" disabled>
              <AlertCircle className="w-4 h-4 mr-2" />
              Security Analysis
              <Badge variant="secondary" className="ml-2">
                Coming Soon
              </Badge>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
