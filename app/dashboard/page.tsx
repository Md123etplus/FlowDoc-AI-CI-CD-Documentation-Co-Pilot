"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Github, Search, Star, GitFork, Clock, Plus, ArrowRight, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useGitHubRepositories } from "@/hooks/use-github"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const { repositories, loading, error, refetch } = useGitHubRepositories()

  const filteredRepos = repositories.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

    // For now, we'll treat all repos as "unanalyzed" since we don't have analysis tracking yet
    if (selectedFilter === "analyzed") return false // matchesSearch && repo.analyzed
    if (selectedFilter === "unanalyzed") return matchesSearch // && !repo.analyzed
    return matchesSearch
  })

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return "1 day ago"
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`
    return `${Math.floor(diffInHours / 168)} weeks ago`
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Your Repositories</h1>
              <p className="text-muted-foreground">Loading your repositories...</p>
            </div>
          </div>
          <div className="grid gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg" />
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-32" />
                        <div className="h-3 bg-muted rounded w-48" />
                      </div>
                    </div>
                    <div className="h-9 bg-muted rounded w-20" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="text-center py-12">
            <Github className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load repositories</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Your Repositories</h1>
            <p className="text-muted-foreground">Select a repository to generate CI/CD pipelines and documentation</p>
          </div>
          <Button onClick={refetch}>
            <Plus className="w-4 h-4 mr-2" />
            Refresh Repos
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("all")}
            >
              All ({repositories.length})
            </Button>
            <Button
              variant={selectedFilter === "analyzed" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("analyzed")}
            >
              Analyzed (0)
            </Button>
            <Button
              variant={selectedFilter === "unanalyzed" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("unanalyzed")}
            >
              New ({repositories.length})
            </Button>
          </div>
        </div>

        {/* Repository Grid */}
        <div className="grid gap-6">
          {filteredRepos.map((repo) => (
            <Card key={repo.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Github className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{repo.name}</CardTitle>
                        {repo.private && (
                          <Badge variant="secondary" className="text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {repo.description || "No description available"}
                      </CardDescription>
                    </div>
                  </div>
                  <Link href={`/analyze/${repo.full_name}`}>
                    <Button>
                      Analyze
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    {repo.language && (
                      <div className="flex items-center space-x-1">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            repo.language === "TypeScript"
                              ? "bg-blue-500"
                              : repo.language === "JavaScript"
                                ? "bg-yellow-500"
                                : repo.language === "Python"
                                  ? "bg-green-500"
                                  : repo.language === "Java"
                                    ? "bg-red-500"
                                    : "bg-gray-500"
                          }`}
                        />
                        <span>{repo.language}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{repo.stargazers_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <GitFork className="w-4 h-4" />
                      <span>{repo.forks_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Updated {formatTimeAgo(repo.updated_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRepos.length === 0 && (
          <div className="text-center py-12">
            <Github className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No repositories found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search query" : "No repositories match the selected filter"}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
