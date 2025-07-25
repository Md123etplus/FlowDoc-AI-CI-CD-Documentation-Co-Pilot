"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Github, Loader2 } from "lucide-react"

interface GitHubAuthModalProps {
  children: React.ReactNode
}

export function GitHubAuthModal({ children }: GitHubAuthModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleGitHubAuth = async () => {
    setIsLoading(true)
    try {
      // Get the GitHub OAuth URL from our API
      const response = await fetch("/api/auth/github")

      if (!response.ok) {
        throw new Error("Failed to get GitHub OAuth URL")
      }

      const data = await response.json()

      if (data.url) {
        // Open GitHub OAuth in a popup window
        const popup = window.open(data.url, "github-auth", "width=600,height=700,scrollbars=yes,resizable=yes")

        // Listen for the popup to close or send a message
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed)
            setIsLoading(false)
            setIsOpen(false)
            // Refresh the page to update authentication state
            window.location.reload()
          }
        }, 1000)

        // Listen for messages from the popup
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return

          if (event.data.type === "GITHUB_AUTH_SUCCESS") {
            clearInterval(checkClosed)
            popup?.close()
            setIsLoading(false)
            setIsOpen(false)
            window.removeEventListener("message", messageListener)
            // Refresh the page to update authentication state
            window.location.reload()
          } else if (event.data.type === "GITHUB_AUTH_ERROR") {
            clearInterval(checkClosed)
            popup?.close()
            setIsLoading(false)
            window.removeEventListener("message", messageListener)
            console.error("GitHub authentication failed:", event.data.error)
          }
        }

        window.addEventListener("message", messageListener)
      } else {
        throw new Error("No OAuth URL received")
      }
    } catch (error) {
      console.error("GitHub authentication error:", error)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to GitHub</DialogTitle>
          <DialogDescription>
            Sign in with your GitHub account to access your repositories and generate CI/CD pipelines.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <Button onClick={handleGitHubAuth} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Sign in with GitHub
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            We'll redirect you to GitHub to authorize access to your repositories.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
