"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  GitBranch,
  Star,
  GitFork,
  Eye,
  Calendar,
  User,
  FileText,
  Folder,
  AlertCircle,
  Download,
  ExternalLink,
} from "lucide-react"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  private: boolean
  html_url: string
  clone_url: string
  stargazers_count: number
  watchers_count: number
  forks_count: number
  language: string
  created_at: string
  updated_at: string
  pushed_at: string
  owner: {
    login: string
    avatar_url: string
  }
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
  const [repository, setRepository] = useState<Repository | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Parse repository ID from params
  const repositoryId = Array.isArray(params.id) ? params.id.join("/") : params.id

  useEffect(() => {
    if (!repositoryId) {
      setError("Repository ID is required")
      setLoading(false)
      return
    }

    // Validate repository format (owner/repo)
    const parts = repositoryId.split("/")
    if (parts.length !== 2) {
      setError("Invalid repository format. Expected format: owner/repo")
      setLoading(false)
      return
    }

    const [owner, repo] = parts

    const fetchRepository = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/github/repositories/${owner}/${repo}`)

        if (!response.ok) {
          if (response.status === 401) {
            setError("Authentication required. Please log in to continue.")
            return
          }
          if (response.status === 404) {
            setError("Repository not found. Please check if the repository exists and you have access to it.")
            return
          }
          throw new Error("Failed to fetch repository")
        }

        const data = await response.json()
        setRepository(data)
      } catch (err) {
        console.error("Error fetching repository:", err)
        setError("Failed to load repository. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchRepository()
  }, [repositoryId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
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
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error}
            <br />
            Please check if the repository exists and you have access to it.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!repository) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Repository not found or failed to load.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Calculate language percentages
  const totalBytes = Object.values(repository.languages).reduce((sum, bytes) => sum + bytes, 0)
  const languagePercentages = Object.entries(repository.languages)
    .map(([lang, bytes]) => ({
      language: lang,
      percentage: ((bytes / totalBytes) * 100).toFixed(1),
    }))
    .sort((a, b) => Number.parseFloat(b.percentage) - Number.parseFloat(a.percentage))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Repository Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{repository.name}</h1>
              <Badge variant={repository.private ? "secondary" : "default"}>
                {repository.private ? "Private" : "Public"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{repository.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {repository.owner.login}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Updated {new Date(repository.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>

        {/* Repository Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-2 p-4">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{repository.stargazers_count}</div>
                <div className="text-sm text-muted-foreground">Stars</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-2 p-4">
              <GitFork className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{repository.forks_count}</div>
                <div className="text-sm text-muted-foreground">Forks</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-2 p-4">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{repository.watchers_count}</div>
                <div className="text-sm text-muted-foreground">Watchers</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-2 p-4">
              <GitBranch className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{repository.language || "N/A"}</div>
                <div className="text-sm text-muted-foreground">Primary Language</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Repository Details */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Repository Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Name:</span>
                    <span className="font-mono">{repository.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(repository.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Push:</span>
                    <span>{new Date(repository.pushed_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clone URL:</span>
                    <span className="font-mono text-sm truncate">{repository.clone_url}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Generate CI/CD pipelines and documentation for this repository</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Generate CI/CD Pipeline
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" disabled>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Documentation
                  </Button>
                  <p className="text-xs text-muted-foreground">AI-powered features coming soon</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Repository Files</CardTitle>
                <CardDescription>Browse the files and folders in this repository</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {repository.contents.map((item) => (
                      <div key={item.path} className="flex items-center gap-2 p-2 rounded hover:bg-muted">
                        {item.type === "dir" ? (
                          <Folder className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="flex-1">{item.name}</span>
                        {item.size && (
                          <span className="text-sm text-muted-foreground">{(item.size / 1024).toFixed(1)} KB</span>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="languages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Language Distribution</CardTitle>
                <CardDescription>Programming languages used in this repository</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {languagePercentages.map(({ language, percentage }) => (
                    <div key={language} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{language}</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
