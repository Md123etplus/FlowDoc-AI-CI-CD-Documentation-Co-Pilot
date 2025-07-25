"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft, Copy, Download, FileCode, FileText, GitBranch, GitPullRequest } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Repository {
  id: string
  name: string
  owner: {
    login: string
  }
  description: string
  defaultBranch: string
}

interface FileContent {
  name: string
  path: string
  content: string
  type: string
}

export default function AnalyzePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [repository, setRepository] = useState<Repository | null>(null)
  const [files, setFiles] = useState<FileContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("preview")
  const [generatingCICD, setGeneratingCICD] = useState(false)
  const [generatingDocs, setGeneratingDocs] = useState(false)
  const [cicdOutput, setCicdOutput] = useState<string | null>(null)
  const [docsOutput, setDocsOutput] = useState<string | null>(null)

  const repoId = params.id as string

  useEffect(() => {
    async function fetchRepositoryData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch repository details
        const repoResponse = await fetch(`/api/github/repositories/${repoId}`)

        if (!repoResponse.ok) {
          throw new Error("Failed to fetch repository details")
        }

        const repoData = await repoResponse.json()
        setRepository(repoData)

        // Fetch repository files
        const filesResponse = await fetch(`/api/github/repositories/${repoData.owner.login}/${repoData.name}/files`)

        if (!filesResponse.ok) {
          throw new Error("Failed to fetch repository files")
        }

        const filesData = await filesResponse.json()
        setFiles(filesData)
      } catch (err) {
        console.error("Error fetching repository data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (repoId) {
      fetchRepositoryData()
    }
  }, [repoId])

  const handleGenerateCICD = async () => {
    setGeneratingCICD(true)

    try {
      // This would be replaced with actual AI generation
      // For now, we'll simulate a delay and return a placeholder
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setCicdOutput(`name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-output
        path: .next/
        retention-days: 7`)

      toast({
        title: "CI/CD Pipeline Generated",
        description: "Your CI/CD pipeline configuration has been generated successfully.",
      })
    } catch (err) {
      console.error("Error generating CI/CD pipeline:", err)
      toast({
        title: "Generation Failed",
        description: "Failed to generate CI/CD pipeline. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGeneratingCICD(false)
    }
  }

  const handleGenerateDocs = async () => {
    setGeneratingDocs(true)

    try {
      // This would be replaced with actual AI generation
      // For now, we'll simulate a delay and return a placeholder
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setDocsOutput(`# ${repository?.name || "Project"} Documentation

## Overview

This project is a Next.js application that helps developers generate smart CI/CD pipeline files and project documentation from their GitHub repositories using AI.

## Features

- GitHub OAuth2 integration
- Repository selection and analysis
- AI-powered CI/CD pipeline generation
- AI-powered documentation generation
- File preview and editing capabilities

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- GitHub account

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/${repository?.owner.login}/${repository?.name}.git
cd ${repository?.name}
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3000
\`\`\`

4. Run the development server
\`\`\`bash
npm run dev
\`\`\`

## Project Structure

- \`/app\` - Next.js App Router pages and API routes
- \`/components\` - React components
- \`/lib\` - Utility functions and libraries
- \`/hooks\` - Custom React hooks
- \`/public\` - Static assets

## API Reference

### GitHub OAuth

- \`GET /api/auth/github\` - Initiates GitHub OAuth flow
- \`GET /api/auth/github/callback\` - GitHub OAuth callback
- \`GET /api/auth/logout\` - Logs out the current user

### GitHub API

- \`GET /api/github/repositories\` - Lists user repositories
- \`GET /api/github/repositories/:owner/:repo\` - Gets repository details
- \`GET /api/github/repositories/:owner/:repo/files\` - Gets repository files

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.`)

      toast({
        title: "Documentation Generated",
        description: "Your project documentation has been generated successfully.",
      })
    } catch (err) {
      console.error("Error generating documentation:", err)
      toast({
        title: "Generation Failed",
        description: "Failed to generate documentation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGeneratingDocs(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard.",
    })
  }

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container py-6 space-y-8">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{repository?.name}</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <GitBranch className="mr-1 h-3 w-3" />
              <span>{repository?.defaultBranch || "main"}</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview">File Preview</TabsTrigger>
          <TabsTrigger value="cicd">CI/CD Generator</TabsTrigger>
          <TabsTrigger value="docs">AutoDoc Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          {files.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No files found</AlertTitle>
              <AlertDescription>
                No relevant files were found in this repository. Try selecting a different repository.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {files.slice(0, 4).map((file) => (
                <Card key={file.path}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {file.type === "file" ? (
                          file.name.endsWith(".md") ? (
                            <FileText className="h-4 w-4 mr-2" />
                          ) : (
                            <FileCode className="h-4 w-4 mr-2" />
                          )
                        ) : (
                          <GitPullRequest className="h-4 w-4 mr-2" />
                        )}
                        <CardTitle className="text-sm font-medium">{file.name}</CardTitle>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(file.content)} className="h-6 w-6">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <CardDescription className="text-xs truncate">{file.path}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-md p-2 h-32 overflow-auto">
                      <pre className="text-xs whitespace-pre-wrap">{file.content.slice(0, 500)}</pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cicd" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CI/CD Pipeline Generator</CardTitle>
              <CardDescription>Generate optimized GitHub Actions workflows for your repository</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p>
                    This tool will analyze your repository and generate a CI/CD pipeline configuration optimized for
                    your project.
                  </p>
                </div>
                <Button onClick={handleGenerateCICD} disabled={generatingCICD}>
                  {generatingCICD ? "Generating..." : "Generate Pipeline"}
                </Button>
              </div>

              {cicdOutput && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Generated Pipeline</h3>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopy(cicdOutput)}>
                          <Copy className="h-3 w-3 mr-2" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(cicdOutput, "github-workflow.yml")}
                        >
                          <Download className="h-3 w-3 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted rounded-md p-4 overflow-auto max-h-96">
                      <pre className="text-sm whitespace-pre-wrap">{cicdOutput}</pre>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AutoDoc Generator</CardTitle>
              <CardDescription>Generate comprehensive documentation for your repository</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p>
                    This tool will analyze your repository and generate comprehensive documentation including README,
                    installation instructions, and API references.
                  </p>
                </div>
                <Button onClick={handleGenerateDocs} disabled={generatingDocs}>
                  {generatingDocs ? "Generating..." : "Generate Documentation"}
                </Button>
              </div>

              {docsOutput && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Generated Documentation</h3>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopy(docsOutput)}>
                          <Copy className="h-3 w-3 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(docsOutput, "README.md")}>
                          <Download className="h-3 w-3 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted rounded-md p-4 overflow-auto max-h-96">
                      <pre className="text-sm whitespace-pre-wrap">{docsOutput}</pre>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
