"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Github, Shield, Eye, GitFork, Loader2 } from "lucide-react"
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

  const handleGitHubAuth = () => {
    setIsLoading(true)

    // Redirect directly to the GitHub OAuth endpoint
    window.location.href = "/api/auth/github"
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

          <Button onClick={handleGitHubAuth} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Github className="w-5 h-5 mr-2" />
                Continue with GitHub
              </>
            )}
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
