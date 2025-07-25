"use client"

import { useState, useEffect } from "react"
import type { GitHubRepo, GitHubUser, GitHubFile } from "@/lib/github"

export function useGitHubUser() {
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/github/user")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else if (response.status === 401) {
          setUser(null)
        } else {
          throw new Error("Failed to fetch user")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading, error }
}

export function useGitHubRepositories() {
  const [repositories, setRepositories] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRepositories = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/github/repositories")
      if (response.ok) {
        const repos = await response.json()
        setRepositories(repos)
      } else {
        throw new Error("Failed to fetch repositories")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRepositories()
  }, [])

  return { repositories, loading, error, refetch: fetchRepositories }
}

export function useGitHubRepository(owner: string, repo: string) {
  const [repository, setRepository] = useState<GitHubRepo | null>(null)
  const [files, setFiles] = useState<{
    workflows: GitHubFile[]
    documentation: GitHubFile[]
  }>({ workflows: [], documentation: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRepository() {
      if (!owner || !repo) return

      try {
        setLoading(true)
        const response = await fetch(`/api/github/repositories/${owner}/${repo}`)
        if (response.ok) {
          const data = await response.json()
          setRepository(data.repository)
          setFiles(data.files)
        } else {
          throw new Error("Failed to fetch repository")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchRepository()
  }, [owner, repo])

  return { repository, files, loading, error }
}
