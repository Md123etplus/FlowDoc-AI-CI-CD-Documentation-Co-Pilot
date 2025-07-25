"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GitHubAuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GitHubAuthModal({ open, onOpenChange }: GitHubAuthModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/github")

      if (!response.ok) {
        throw new Error("Failed to initiate GitHub authentication")
      }

      const { url } = await response.json()

      // Open GitHub auth in a popup
      const width = 600
      const height = 700
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2

      const popup = window.open(
        url,
        "github-auth",
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`,
      )

      if (!popup) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site and try again.",
          variant: "destructive",
        })
        return
      }

      // Check if the popup is closed or redirected to our callback URL
      const checkPopup = setInterval(() => {
        try {
          // If popup is closed
          if (popup.closed) {
            clearInterval(checkPopup)
            setLoading(false)
            // Check if we have a session after popup is closed
            checkSession()
          }
        } catch (error) {
          // This can happen if the popup navigates to a different origin
          // We'll just continue checking
        }
      }, 500)
    } catch (error) {
      console.error("Error during GitHub authentication:", error)
      toast({
        title: "Authentication Error",
        description: "Failed to authenticate with GitHub. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session")

      if (response.ok) {
        const session = await response.json()

        if (session && session.user) {
          // Successfully authenticated
          toast({
            title: "Authentication Successful",
            description: `Welcome, ${session.user.name || session.user.login}!`,
          })
          onOpenChange(false)
          // Redirect to dashboard
          window.location.href = "/dashboard"
        }
      }
    } catch (error) {
      console.error("Error checking session:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect with GitHub</DialogTitle>
          <DialogDescription>
            Connect your GitHub account to analyze your repositories and generate documentation.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button onClick={handleAuth} disabled={loading} className="w-full">
            <Github className="mr-2 h-4 w-4" />
            {loading ? "Connecting..." : "Connect GitHub Account"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            We only request read access to your repositories. You can revoke access at any time.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
