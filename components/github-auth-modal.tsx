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
import { Github } from "lucide-react"

interface GitHubAuthModalProps {
  children: React.ReactNode
}

export function GitHubAuthModal({ children }: GitHubAuthModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleGitHubAuth = () => {
    // Direct redirect to GitHub OAuth
    window.location.href = "/api/auth/github"
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to GitHub</DialogTitle>
          <DialogDescription>
            Connect your GitHub account to analyze repositories and generate CI/CD pipelines.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Button onClick={handleGitHubAuth} className="w-full">
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            By connecting, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
