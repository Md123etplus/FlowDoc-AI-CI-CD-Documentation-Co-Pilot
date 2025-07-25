"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, GitFork, Eye, EyeOff, Calendar, Search, Filter } from "lucide-react"

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
}

export default function DashboardPage() {
  const router = useRouter()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState("all")
  const [languageFilter, setLanguageFilter] = useState("all")

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

      const repos = await response.json()
      setRepositories(repos)
    } catch (err) {
      console.error("Error fetching repositories:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
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
    router.push(`/analyze/${repo.full_name}`)
  }

  const getUniqueLanguages = () => {
    const languages = repositories.map((repo) => repo.language).filter((lang): lang is string => lang !== null)
    return Array.from(new Set(languages)).sort()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
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
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchRepositories} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Repositories</h1>
        <p className="text-muted-foreground">
          Select a repository to analyze and generate CI/CD pipelines or documentation.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Repositories</SelectItem>
            <SelectItem value="public">Public Only</SelectItem>
            <SelectItem value="private">Private Only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRepositories.map((repo) => (
          <Card key={repo.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold">{repo.name}</CardTitle>
                  <CardDescription className="mt-1">{repo.description || "No description available"}</CardDescription>
                </div>
                <Badge variant={repo.private ? "secondary" : "default"}>
                  {repo.private ? (
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
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {repo.stargazers_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    {repo.forks_count}
                  </div>
                </div>
                {repo.language && (
                  <Badge variant="outline" className="text-xs">
                    {repo.language}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Updated {new Date(repo.updated_at).toLocaleDateString()}
                </div>
                <Button size="sm" onClick={() => handleAnalyzeRepository(repo)} className="ml-2">
                  Analyze Repository
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRepositories.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No repositories found matching your filters.</p>
        </div>
      )}
    </div>
  )
}
