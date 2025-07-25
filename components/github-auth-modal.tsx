"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Github, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GitHubAuthModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function GitHubAuthModal({ isOpen, onOpenChange, onSuccess }: GitHubAuthModalProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGitHubAuth = async () => {
    try {
      setIsAuthenticating(true)
      setError(null)

      // Get the authorization URL from our API
      const response = await fetch("/api/auth/github")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to initiate GitHub authentication")
      }

      const { authUrl } = await response.json()

      // Open popup window for GitHub OAuth
      const popup = window.open(authUrl, "github-auth", "width=600,height=700,scrollbars=yes,resizable=yes")

      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for this site and try again.")
      }

      // Listen for messages from the popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return

        if (event.data.type === "GITHUB_AUTH_SUCCESS") {
          popup.close()
          setIsAuthenticating(false)
          onOpenChange(false)
          toast({
            title: "Authentication successful",
            description: "You have been successfully authenticated with GitHub.",
          })
          onSuccess?.()
          window.location.reload() // Refresh to update user state
        } else if (event.data.type === "GITHUB_AUTH_ERROR") {
          popup.close()
          setIsAuthenticating(false)
          setError(event.data.error || "Authentication failed")
        }
      }

      window.addEventListener("message", handleMessage)

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener("message", handleMessage)
          setIsAuthenticating(false)
        }
      }, 1000)
    } catch (err) {
      console.error("GitHub auth error:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setIsAuthenticating(false)
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

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-medium">This app will be able to:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Read your public and private repositories
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Access repository files and metadata
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Read your email address
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAuthenticating}>
            Cancel
          </Button>
          <Button onClick={handleGitHubAuth} disabled={isAuthenticating}>
            {isAuthenticating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Connect GitHub
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
