"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
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
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRepositories() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/github/repositories?per_page=20")

        if (!response.ok) {
          if (response.status === 401) {
            // Redirect to login if unauthorized
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
    if (searchQuery.trim() === "") {
      setFilteredRepositories(repositories)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = repositories.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          (repo.description && repo.description.toLowerCase().includes(query)) ||
          (repo.language && repo.language.toLowerCase().includes(query)),
      )
      setFilteredRepositories(filtered)
    }
  }, [searchQuery, repositories])

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">
            Select a repository to analyze and generate documentation or CI/CD pipelines.
          </p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search repositories..."
            className="w-full sm:w-[250px] pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
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
                {searchQuery
                  ? "No repositories match your search criteria."
                  : "No repositories found. Connect your GitHub account to see your repositories."}
              </p>
              {searchQuery && (
                <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setSearchQuery("")}>
                  Clear Search
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
                  <div>
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                    <CardDescription>{repo.owner.login}</CardDescription>
                  </div>
                  <Badge variant={repo.visibility === "public" ? "secondary" : "outline"}>{repo.visibility}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                  {repo.description || "No description provided"}
                </p>
                <div className="flex items-center mt-4 space-x-4 text-xs text-muted-foreground">
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
                  <div className="hidden sm:block">Updated {formatDate(repo.updatedAt)}</div>
                </div>
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
