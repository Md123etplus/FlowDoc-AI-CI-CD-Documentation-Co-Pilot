"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, GitFork, Eye, EyeOff, Calendar, Search } from "lucide-react"
import Link from "next/link"

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
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState("all")
  const [languageFilter, setLanguageFilter] = useState("all")

  useEffect(() => {
    async function fetchRepositories() {
      try {
        setLoading(true)
        const response = await fetch("/api/github/repositories?per_page=50")

        if (!response.ok) {
          throw new Error("Failed to fetch repositories")
        }

        const repos = await response.json()
        setRepositories(repos)
      } catch (error) {
        console.error("Error fetching repositories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRepositories()
  }, [])

  // Filter repositories based on search and filters
  const filteredRepositories = repositories.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (repo.language && repo.language.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesVisibility =
      visibilityFilter === "all" ||
      (visibilityFilter === "public" && !repo.private) ||
      (visibilityFilter === "private" && repo.private)

    const matchesLanguage = languageFilter === "all" || repo.language === languageFilter

    return matchesSearch && matchesVisibility && matchesLanguage
  })

  // Get unique languages for filter
  const languages = Array.from(new Set(repositories.map((repo) => repo.language).filter(Boolean)))

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Repositories</h1>
        <p className="text-muted-foreground">
          Manage and analyze your GitHub repositories. Generate CI/CD pipelines and documentation.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
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
            {languages.map((language) => (
              <SelectItem key={language} value={language!}>
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
                  <CardTitle className="text-lg mb-1">{repo.name}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={repo.private ? "secondary" : "default"} className="text-xs">
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
                    {repo.language && (
                      <Badge variant="outline" className="text-xs">
                        {repo.language}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <CardDescription className="line-clamp-2">
                {repo.description || "No description available"}
              </CardDescription>
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
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(repo.updated_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/analyze/${repo.full_name}`}>Analyze Repository</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRepositories.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {searchTerm || visibilityFilter !== "all" || languageFilter !== "all"
              ? "No repositories match your filters"
              : "No repositories found"}
          </div>
          {(searchTerm || visibilityFilter !== "all" || languageFilter !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setVisibilityFilter("all")
                setLanguageFilter("all")
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
