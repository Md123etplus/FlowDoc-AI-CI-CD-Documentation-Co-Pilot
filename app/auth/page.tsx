"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams?.get("error")
  const { toast } = useToast()

  useEffect(() => {
    if (error) {
      toast({
        title: "Authentication Error",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    }
    // Redirect to homepage - we're using the modal approach now
    router.push("/")
  }, [error, toast, router])

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "access_denied":
        return "GitHub access was denied. Please try again."
      case "oauth_failed":
        return "OAuth authentication failed. Please try again."
      case "no_code":
        return "No authorization code received from GitHub."
      default:
        return "An error occurred during authentication."
    }
  }

  const handleGitHubLogin = () => {
    window.location.href = "/api/auth/github"
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to homepage...</p>
    </div>
  )
}
