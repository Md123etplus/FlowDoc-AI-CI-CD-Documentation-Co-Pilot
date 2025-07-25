"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Search, Star, GitFork, Calendar, Lock, Globe, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Repository {
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
  owner: {
    login: string
    avatar_url: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all")
  const [languageFilter, setLanguageFilter] = useState<string>("all")

  useEffect(() => {
    fetchRepositories()
  }, [])

  useEffect(() => {
    filterRepositories()
  }, [repositories, searchQuery, visibilityFilter, languageFilter])

  const fetchRepositories = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/github/repositories?per_page=50")

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/")
          return
        }
        throw new Error("Failed to fetch repositories")
      }

      const data = await response.json()
      setRepositories(data)
    } catch (err) {
      console.error("Error fetching repositories:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const filterRepositories = () => {
    let filtered = repositories

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (repo) =>
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.language?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Visibility filter
    if (visibilityFilter !== "all") {
      filtered = filtered.filter((repo) => (visibilityFilter === "private" ? repo.private : !repo.private))
    }

    // Language filter
    if (languageFilter !== "all") {
      filtered = filtered.filter((repo) => repo.language === languageFilter)
    }

    setFilteredRepositories(filtered)
  }

  const handleAnalyzeRepository = (repo: Repository) => {
    router.push(`/analyze/${repo.owner.login}/${repo.name}`)
  }

  const getUniqueLanguages = () => {
    const languages = repositories.map((repo) => repo.language).filter((lang): lang is string => lang !== null)
    return Array.from(new Set(languages)).sort()
  }

  if (loading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Repositories</h1>
          <p className="text-muted-foreground">Manage and analyze your GitHub repositories</p>
        </div>
        <Button onClick={fetchRepositories}>Refresh</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {getUniqueLanguages().map((language) => (
              <SelectItem key={language} value={language}>
                {language}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Repository Grid */}
      {filteredRepositories.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No repositories found</h3>
          <p className="text-muted-foreground">
            {repositories.length === 0
              ? "You don't have any repositories yet."
              : "Try adjusting your search or filter criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepositories.map((repo) => (
            <Card key={repo.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{repo.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{repo.owner.login}</CardDescription>
                  </div>
                  <Badge variant={repo.private ? "secondary" : "default"} className="ml-2">
                    {repo.private ? (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </>
                    ) : (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {repo.description || "No description available"}
                </p>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    {repo.language && (
                      <span className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center">
                      <GitFork className="h-3 w-3 mr-1" />
                      {repo.forks_count}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Updated {new Date(repo.updated_at).toLocaleDateString()}
                  </span>
                  <Button size="sm" onClick={() => handleAnalyzeRepository(repo)}>
                    Analyze
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
