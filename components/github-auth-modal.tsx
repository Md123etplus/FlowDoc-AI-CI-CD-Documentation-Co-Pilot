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
    try {
      setIsLoading(true)
      // Redirect to GitHub OAuth
      window.location.href = "/api/auth/github"
    } catch (error) {
      console.error("Authentication error:", error)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to GitHub</DialogTitle>
          <DialogDescription>
            Connect your GitHub account to analyze your repositories and generate CI/CD pipelines.
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
                Continue with GitHub
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
