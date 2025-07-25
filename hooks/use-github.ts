"use client"

import { useState, useEffect } from "react"

interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
}

interface UserSession {
  accessToken: string
  user: GitHubUser
  authenticated: boolean
}

export function useGitHub() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session")
      const data = await response.json()

      if (data.authenticated) {
        setSession(data)
      } else {
        setSession(null)
      }
    } catch (error) {
      console.error("Error checking session:", error)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    window.location.href = "/api/auth/github"
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setSession(null)
      window.location.href = "/"
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return {
    session,
    loading,
    login,
    logout,
    isAuthenticated: !!session?.authenticated,
  }
}
