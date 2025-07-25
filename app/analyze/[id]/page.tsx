"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Github,
  FileText,
  GitBranch,
  Copy,
  Download,
  RefreshCw,
  Eye,
  Code,
  Zap,
  CheckCircle,
  ArrowLeft,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useGitHubRepository } from "@/hooks/use-github"
import Link from "next/link"

// Mock repository data
const mockRepo = {
  id: 1,
  name: "awesome-react-app",
  description: "A modern React application with TypeScript and Tailwind CSS",
  language: "TypeScript",
  files: {
    "README.md": `# Awesome React App

A modern React application built with TypeScript and Tailwind CSS.

## Features
- Modern React with TypeScript
- Tailwind CSS for styling
- Component-based architecture

## Getting Started
\`\`\`bash
npm install
npm start
\`\`\``,
    "package.json": `{
  "name": "awesome-react-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^4.9.0",
    "tailwindcss": "^3.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  }
}`,
    ".github/workflows/ci.yml": `name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test`,
  },
}

export default function AnalyzePage({ params }: { params: { id: string } }) {
  // Parse owner/repo from the full_name parameter
  const [owner, repo] = decodeURIComponent(params.id).split("/")

  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")
  const [cicdOutput, setCicdOutput] = useState("")
  const [docOutput, setDocOutput] = useState("")
  const { toast } = useToast()

  const { repository, files, loading, error } = useGitHubRepository(owner, repo)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded w-48 animate-pulse" />
              <div className="h-4 bg-muted rounded w-64 animate-pulse" />
            </div>
          </div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-32" />
                  <div className="h-4 bg-muted rounded w-48" />
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !repository) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Github className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Repository not found</h3>
          <p className="text-muted-foreground mb-4">{error || "The repository could not be loaded."}</p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const generateCICD = async () => {
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      setCicdOutput(`name: Advanced CI/CD Pipeline
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run tests
      run: npm test -- --coverage
      
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      
  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18.x'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: npm run build
      
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: build/
        
  security:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Run security audit
      run: npm audit --audit-level high
      
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}`)
      setIsGenerating(false)
      toast({
        title: "CI/CD Pipeline Generated",
        description: "Your optimized GitHub Actions workflow is ready!",
      })
    }, 2000)
  }

  const generateDocs = async () => {
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      setDocOutput(`# Awesome React App

[![CI](https://github.com/user/awesome-react-app/workflows/CI/badge.svg)](https://github.com/user/awesome-react-app/actions)
[![Coverage](https://codecov.io/gh/user/awesome-react-app/branch/main/graph/badge.svg)](https://codecov.io/gh/user/awesome-react-app)

A modern, production-ready React application built with TypeScript and Tailwind CSS. This project demonstrates best practices for React development with a focus on performance, accessibility, and maintainability.

## 🚀 Features

- **Modern React**: Built with React 18 and functional components
- **TypeScript**: Full type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Component Architecture**: Modular and reusable component design
- **Testing**: Comprehensive test suite with Jest and React Testing Library
- **CI/CD**: Automated testing and deployment with GitHub Actions

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 16.x or higher)
- npm or yarn package manager
- Git

## 🛠️ Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/user/awesome-react-app.git
cd awesome-react-app
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm start
\`\`\`

The application will open in your browser at \`http://localhost:3000\`.

## 🏗️ Project Structure

\`\`\`
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── styles/             # Global styles and Tailwind config
\`\`\`

## 🧪 Testing

Run the test suite:
\`\`\`bash
npm test
\`\`\`

Generate coverage report:
\`\`\`bash
npm test -- --coverage
\`\`\`

## 🚀 Deployment

The application is automatically deployed using GitHub Actions when changes are pushed to the main branch.

For manual deployment:
\`\`\`bash
npm run build
npm run deploy
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- TypeScript team for type safety`)
      setIsGenerating(false)
      toast({
        title: "Documentation Generated",
        description: "Your comprehensive README.md is ready!",
      })
    }, 2000)
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: `${type} has been copied to your clipboard.`,
    })
  }

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "File downloaded",
      description: `${filename} has been downloaded.`,
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Github className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{repository.name}</h1>
              <p className="text-muted-foreground">{repository.description || "No description available"}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {repository.private && <Badge variant="secondary">Private</Badge>}
            <Badge variant="outline">{repository.language || "Unknown"}</Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>File Preview</span>
            </TabsTrigger>
            <TabsTrigger value="cicd" className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4" />
              <span>CI/CD Generator</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>AutoDoc Generator</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="w-5 h-5" />
                  <span>Repository Files</span>
                </CardTitle>
                <CardDescription>Key files from your repository that will be analyzed by our AI tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {files.documentation.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Documentation Files
                      </h4>
                      <div className="space-y-4">
                        {files.documentation.map((file) => (
                          <div key={file.path} className="border rounded-lg">
                            <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4" />
                                <span className="font-mono text-sm">{file.path}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {file.size} bytes
                              </Badge>
                            </div>
                            <ScrollArea className="h-48">
                              <pre className="p-4 text-sm font-mono whitespace-pre-wrap">{file.content}</pre>
                            </ScrollArea>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {files.workflows.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <GitBranch className="w-4 h-4 mr-2" />
                        Workflow Files
                      </h4>
                      <div className="space-y-4">
                        {files.workflows.map((file) => (
                          <div key={file.path} className="border rounded-lg">
                            <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
                              <div className="flex items-center space-x-2">
                                <GitBranch className="w-4 h-4" />
                                <span className="font-mono text-sm">{file.path}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {file.size} bytes
                              </Badge>
                            </div>
                            <ScrollArea className="h-48">
                              <pre className="p-4 text-sm font-mono whitespace-pre-wrap">{file.content}</pre>
                            </ScrollArea>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {files.documentation.length === 0 && files.workflows.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No files found</h3>
                      <p className="text-muted-foreground">
                        No documentation or workflow files were found in this repository.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cicd" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GitBranch className="w-5 h-5" />
                    <span>CI/CD Generator</span>
                  </CardTitle>
                  <CardDescription>
                    Generate optimized GitHub Actions workflows based on your project structure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Multi-environment testing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Security scanning</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Code coverage reporting</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Artifact management</span>
                    </div>
                  </div>

                  <Separator />

                  <Button onClick={generateCICD} disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate CI/CD Pipeline
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Workflow</CardTitle>
                    {cicdOutput && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(cicdOutput, "CI/CD workflow")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => downloadFile(cicdOutput, "ci.yml")}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {cicdOutput ? (
                    <ScrollArea className="h-96">
                      <Textarea
                        value={cicdOutput}
                        onChange={(e) => setCicdOutput(e.target.value)}
                        className="min-h-96 font-mono text-sm"
                        placeholder="Generated CI/CD workflow will appear here..."
                      />
                    </ScrollArea>
                  ) : (
                    <div className="h-96 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Click "Generate CI/CD Pipeline" to create your workflow</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="docs" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>AutoDoc Generator</span>
                  </CardTitle>
                  <CardDescription>
                    Generate comprehensive documentation including README, API specs, and code comments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Enhanced README.md</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Installation instructions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Usage examples</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Contributing guidelines</span>
                    </div>
                  </div>

                  <Separator />

                  <Button onClick={generateDocs} disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Documentation
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Documentation</CardTitle>
                    {docOutput && (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(docOutput, "Documentation")}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => downloadFile(docOutput, "README.md")}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {docOutput ? (
                    <ScrollArea className="h-96">
                      <Textarea
                        value={docOutput}
                        onChange={(e) => setDocOutput(e.target.value)}
                        className="min-h-96 font-mono text-sm"
                        placeholder="Generated documentation will appear here..."
                      />
                    </ScrollArea>
                  ) : (
                    <div className="h-96 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Click "Generate Documentation" to create your docs</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
