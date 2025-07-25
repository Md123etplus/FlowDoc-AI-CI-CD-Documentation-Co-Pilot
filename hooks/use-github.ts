"use client"

import { useState, useEffect } from "react"

interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
}

interface GitHubRepository {
  id: number
  name: string
  full_name: string
  owner: {
    login: string
    avatar_url: string
  }
  description: string | null
  private: boolean
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  default_branch: string
}

interface GitHubFile {
  name: string
  path: string
  content: string
  size: number
  type: string
}

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
        } else if (response.status !== 401) {
          throw new Error("Failed to fetch user")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading, error }
}

export function useGitHubRepositories() {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRepositories = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/github/repositories?per_page=50")

      if (!response.ok) {
        throw new Error("Failed to fetch repositories")
      }

      const data = await response.json()
      setRepositories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
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
  const [repository, setRepository] = useState<GitHubRepository | null>(null)
  const [files, setFiles] = useState<{ workflows: GitHubFile[]; documentation: GitHubFile[] }>({
    workflows: [],
    documentation: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRepository() {
      if (!owner || !repo) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/github/repositories/${owner}/${repo}`)

        if (!response.ok) {
          throw new Error("Failed to fetch repository")
        }

        const data = await response.json()
        setRepository(data.repository)
        setFiles(data.files)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchRepository()
  }, [owner, repo])

  return { repository, files, loading, error }
}
