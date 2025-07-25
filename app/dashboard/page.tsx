"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GitFork, GitPullRequest, Search, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Repository {
  id: string
  name: string
  fullName: string
  owner: {
    login: string
    avatarUrl: string
  }
  description: string | null
  language: string | null
  stargazersCount: number
  forksCount: number
  updatedAt: string
  visibility: string
  private: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState("all")
  const [languageFilter, setLanguageFilter] = useState("all")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRepositories() {
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
        setFilteredRepositories(data)
      } catch (err) {
        console.error("Error fetching repositories:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: "Failed to load repositories. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRepositories()
  }, [router, toast])

  useEffect(() => {
    let filtered = repositories

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          (repo.description && repo.description.toLowerCase().includes(query)) ||
          (repo.language && repo.language.toLowerCase().includes(query)),
      )
    }

    // Filter by visibility
    if (visibilityFilter !== "all") {
      filtered = filtered.filter((repo) => repo.visibility === visibilityFilter)
    }

    // Filter by language
    if (languageFilter !== "all") {
      filtered = filtered.filter((repo) => repo.language === languageFilter)
    }

    setFilteredRepositories(filtered)
  }, [searchQuery, visibilityFilter, languageFilter, repositories])

  const handleAnalyzeRepo = (repo: Repository) => {
    router.push(`/analyze/${repo.fullName}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  // Get unique languages for filter
  const uniqueLanguages = Array.from(new Set(repositories.map((repo) => repo.language).filter(Boolean))).sort()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">
            Select a repository to analyze and generate documentation or CI/CD pipelines.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search repositories..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All repositories</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All languages</SelectItem>
            {uniqueLanguages.map((language) => (
              <SelectItem key={language} value={language!}>
                {language}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">{error}</p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => router.push("/")}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredRepositories.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                {searchQuery || visibilityFilter !== "all" || languageFilter !== "all"
                  ? "No repositories match your search criteria."
                  : "No repositories found. Connect your GitHub account to see your repositories."}
              </p>
              {(searchQuery || visibilityFilter !== "all" || languageFilter !== "all") && (
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSearchQuery("")
                    setVisibilityFilter("all")
                    setLanguageFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepositories.map((repo) => (
            <Card key={repo.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{repo.name}</CardTitle>
                    <CardDescription className="truncate">{repo.owner.login}</CardDescription>
                  </div>
                  <Badge variant={repo.private ? "secondary" : "outline"}>{repo.private ? "private" : "public"}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">
                  {repo.description || "No description provided"}
                </p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  {repo.language && (
                    <div className="flex items-center">
                      <div
                        className="w-2 h-2 rounded-full mr-1"
                        style={{
                          backgroundColor:
                            repo.language === "JavaScript"
                              ? "#f1e05a"
                              : repo.language === "TypeScript"
                                ? "#3178c6"
                                : repo.language === "Python"
                                  ? "#3572A5"
                                  : repo.language === "Java"
                                    ? "#b07219"
                                    : repo.language === "Go"
                                      ? "#00ADD8"
                                      : repo.language === "Ruby"
                                        ? "#701516"
                                        : repo.language === "PHP"
                                          ? "#4F5D95"
                                          : repo.language === "C#"
                                            ? "#178600"
                                            : repo.language === "C++"
                                              ? "#f34b7d"
                                              : "#8257e5",
                        }}
                      />
                      {repo.language}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    {repo.stargazersCount}
                  </div>
                  <div className="flex items-center">
                    <GitFork className="w-3 h-3 mr-1" />
                    {repo.forksCount}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">Updated {formatDate(repo.updatedAt)}</div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleAnalyzeRepo(repo)}>
                  <GitPullRequest className="w-4 h-4 mr-2" />
                  Analyze Repository
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
