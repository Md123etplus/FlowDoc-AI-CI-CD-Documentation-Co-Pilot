"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Code, FileText, GitBranch, Search, Star } from "lucide-react"
import { useGitHubRepositories, useGitHubUser } from "@/hooks/use-github"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useGitHubUser()
  const { repositories, loading: reposLoading, error } = useGitHubRepositories()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredRepos, setFilteredRepos] = useState<any[]>([])

  useEffect(() => {
    if (!repositories) return

    const filtered = repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    setFilteredRepos(filtered)
  }, [repositories, searchQuery])

  const handleAnalyzeRepo = (repo: any) => {
    router.push(`/analyze/${repo.owner.login}/${repo.name}`)
  }

  if (userLoading || reposLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Repositories</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="relative">
          <Skeleton className="h-10 w-full" />
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
        <h1 className="text-3xl font-bold">Your Repositories</h1>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search repositories..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredRepos.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-medium">No repositories found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {repositories.length === 0
              ? "You don't have any repositories on GitHub yet."
              : "Try adjusting your search query."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map((repo) => (
            <Card key={repo.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg truncate">{repo.name}</CardTitle>
                <CardDescription className="flex items-center text-xs">
                  <GitBranch className="mr-1 h-3 w-3" />
                  {repo.default_branch}
                  <span className="mx-2">•</span>
                  <Star className="mr-1 h-3 w-3" />
                  {repo.stargazers_count}
                  {repo.language && (
                    <>
                      <span className="mx-2">•</span>
                      <Code className="mr-1 h-3 w-3" />
                      {repo.language}
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                  {repo.description || "No description provided."}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleAnalyzeRepo(repo)}>
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
