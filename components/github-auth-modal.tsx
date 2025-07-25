"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Github, Loader2 } from "lucide-react"

interface GitHubAuthModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function GitHubAuthModal({ isOpen, onOpenChange }: GitHubAuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGitHubAuth = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/github")
      const data = await response.json()

      if (data.url) {
        // Open GitHub OAuth in a popup
        const popup = window.open(data.url, "github-auth", "width=600,height=700,scrollbars=yes,resizable=yes")

        // Listen for the popup to close or send a message
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed)
            setIsLoading(false)
            // Refresh the page to update auth state
            window.location.reload()
          }
        }, 1000)

        // Listen for messages from the popup
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return

          if (event.data.type === "GITHUB_AUTH_SUCCESS") {
            popup?.close()
            clearInterval(checkClosed)
            setIsLoading(false)
            onOpenChange(false)
            window.location.reload()
          } else if (event.data.type === "GITHUB_AUTH_ERROR") {
            popup?.close()
            clearInterval(checkClosed)
            setIsLoading(false)
            console.error("GitHub auth error:", event.data.error)
          }
        }

        window.addEventListener("message", messageListener)

        // Cleanup
        setTimeout(() => {
          window.removeEventListener("message", messageListener)
          if (!popup?.closed) {
            popup?.close()
            clearInterval(checkClosed)
            setIsLoading(false)
          }
        }, 300000) // 5 minutes timeout
      }
    } catch (error) {
      console.error("Auth error:", error)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Connect to GitHub
          </DialogTitle>
          <DialogDescription>
            Connect your GitHub account to access your repositories and generate CI/CD pipelines and documentation.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">What we'll access:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Read access to your repositories</li>
              <li>• Your public profile information</li>
              <li>• Repository files and structure</li>
            </ul>
          </div>
          <Button onClick={handleGitHubAuth} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Continue with GitHub
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
