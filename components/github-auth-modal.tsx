"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Github, Shield, Eye, GitFork } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface GitHubAuthModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function GitHubAuthModal({ isOpen, onOpenChange }: GitHubAuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleGitHubLogin = () => {
    setIsLoading(true)

    // Open GitHub OAuth in a popup window
    const width = 600
    const height = 700
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      "/api/auth/github",
      "github-oauth",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`,
    )

    // Check if popup was blocked
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      setIsLoading(false)
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site and try again.",
        variant: "destructive",
      })
      return
    }

    // Poll for popup closure or redirect
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup)
        setIsLoading(false)

        // Check if authentication was successful by checking for session
        fetch("/api/auth/session")
          .then((res) => res.json())
          .then((data) => {
            if (data.authenticated) {
              onOpenChange(false)
              router.push("/dashboard")
              toast({
                title: "Authentication Successful",
                description: "You've successfully connected your GitHub account.",
              })
            }
          })
          .catch(() => {
            // Authentication failed or was cancelled
            toast({
              title: "Authentication Failed",
              description: "GitHub authentication was unsuccessful or cancelled.",
              variant: "destructive",
            })
          })
      }
    }, 500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Github className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Connect with GitHub</DialogTitle>
          <DialogDescription>Securely connect your GitHub account to access your repositories</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <Eye className="w-4 h-4 text-green-500" />
              <span>Read public and private repositories</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <GitFork className="w-4 h-4 text-green-500" />
              <span>Access repository metadata and files</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure OAuth2 authentication</span>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Your data is secure</p>
                <p className="text-muted-foreground">
                  We only read repository files necessary for analysis. No code is stored permanently.
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleGitHubLogin} disabled={isLoading} className="w-full" size="lg">
            <Github className="w-5 h-5 mr-2" />
            {isLoading ? "Connecting..." : "Continue with GitHub"}
          </Button>

          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              OAuth2 Secured
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
