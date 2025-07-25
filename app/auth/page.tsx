"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Github, Shield, Eye, GitFork, Code, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
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
  }, [error, toast])

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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FlowDoc AI</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Github className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Connect with GitHub</CardTitle>
              <CardDescription>
                Securely connect your GitHub account to access your repositories and start generating AI-powered
                workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <Button onClick={handleGitHubLogin} disabled={isLoading} className="w-full text-lg py-6" size="lg">
                <Github className="w-5 h-5 mr-2" />
                {isLoading ? "Connecting..." : "Continue with GitHub"}
              </Button>

              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  OAuth2 Secured
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              By continuing, you agree to our{" "}
              <Link href="#" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
