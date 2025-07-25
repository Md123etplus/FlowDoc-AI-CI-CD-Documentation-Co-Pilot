"use client"

import { useEffect, useState } from "react"

interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
  public_repos: number
  followers: number
  following: number
}

interface GitHubRepository {
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

export function useGitHubUser() {
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/github/user")

        if (!response.ok) {
          if (response.status === 401) {
            setUser(null)
            return
          }
          throw new Error("Failed to fetch user data")
        }

        const userData = await response.json()
        setUser(userData)
      } catch (err) {
        console.error("Error fetching user:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
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

  useEffect(() => {
    async function fetchRepositories() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/github/repositories?per_page=50")

        if (!response.ok) {
          if (response.status === 401) {
            setRepositories([])
            return
          }
          throw new Error("Failed to fetch repositories")
        }

        const repoData = await response.json()
        setRepositories(repoData)
      } catch (err) {
        console.error("Error fetching repositories:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchRepositories()
  }, [])

  return { repositories, loading, error }
}
