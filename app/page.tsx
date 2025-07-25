"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { GitHubAuthModal } from "@/components/github-auth-modal"
import { Code, Github, FileCode, Sparkles, ArrowRight, CheckCircle2, Workflow, BookOpen } from "lucide-react"

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* GitHub Auth Modal */}
      <GitHubAuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />

      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FlowDoc AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button onClick={() => setIsAuthModalOpen(true)} variant="default">
              <Github className="w-4 h-4 mr-2" />
              Login with GitHub
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-6 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              AI-Powered Developer Tools
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Generate Smart CI/CD Pipelines & Documentation with AI
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              FlowDoc AI analyzes your GitHub repositories to create optimized workflows and comprehensive
              documentation, saving you hours of manual work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => setIsAuthModalOpen(true)} size="lg" className="text-lg px-8">
                <Github className="w-5 h-5 mr-2" />
                Connect with GitHub
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent" asChild>
                <Link href="#features">
                  Learn More
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful AI Tools for Developers</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              FlowDoc AI helps you create better CI/CD pipelines and documentation with just a few clicks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* CI/CD Generator */}
            <div className="bg-muted/30 rounded-xl p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Workflow className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">CI/CD Generator</h3>
              <p className="text-muted-foreground mb-6">
                Generate optimized GitHub Actions workflows tailored to your project's specific needs.
              </p>
              <ul className="space-y-3">
                {[
                  "Multi-environment testing configurations",
                  "Security scanning and vulnerability checks",
                  "Optimized build and deployment pipelines",
                  "Custom workflow suggestions based on your tech stack",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AutoDoc Generator */}
            <div className="bg-muted/30 rounded-xl p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AutoDoc Generator</h3>
              <p className="text-muted-foreground mb-6">
                Create comprehensive documentation that helps users understand and contribute to your project.
              </p>
              <ul className="space-y-3">
                {[
                  "Enhanced README.md files with clear instructions",
                  "API documentation and OpenAPI specifications",
                  "Inline code documentation suggestions",
                  "Project structure and architecture documentation",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              FlowDoc AI makes it easy to generate CI/CD pipelines and documentation in just a few steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Github className="w-8 h-8 text-primary" />,
                title: "Connect GitHub",
                description: "Securely connect your GitHub account to access your repositories.",
              },
              {
                icon: <FileCode className="w-8 h-8 text-primary" />,
                title: "Select Repository",
                description: "Choose the repository you want to analyze and generate content for.",
              },
              {
                icon: <Sparkles className="w-8 h-8 text-primary" />,
                title: "Generate Content",
                description: "Let AI analyze your code and generate optimized workflows and documentation.",
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Streamline Your Development Workflow?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Connect your GitHub account now and start generating smart CI/CD pipelines and documentation.
          </p>
          <Button onClick={() => setIsAuthModalOpen(true)} variant="secondary" size="lg" className="text-lg px-8">
            <Github className="w-5 h-5 mr-2" />
            Get Started for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">FlowDoc AI</span>
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FlowDoc AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
