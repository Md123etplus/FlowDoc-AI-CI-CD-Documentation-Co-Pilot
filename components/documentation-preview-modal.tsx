"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Download, Edit, Eye, FileText, Loader2, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface DocumentationPreviewModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  repositoryId: string
}

interface GeneratedDocs {
  documentation: string
  analysis: {
    languages: Record<string, number>
    structure: Array<{ name: string; type: string }>
    hasReadme: boolean
    hasTests: boolean
    hasDocumentation: boolean
    hasCICD: boolean
    packageManager: string | null
    framework: string | null
  }
  repository: {
    name: string
    full_name: string
    description: string
    owner: { login: string }
  }
}

export function DocumentationPreviewModal({ isOpen, onOpenChange, repositoryId }: DocumentationPreviewModalProps) {
  const [loading, setLoading] = useState(false)
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocs | null>(null)
  const [editedDocs, setEditedDocs] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")

  const generateDocumentation = async () => {
    if (!repositoryId) return

    const [owner, repo] = repositoryId.split("/")
    if (!owner || !repo) return

    try {
      setLoading(true)
      const response = await fetch(`/api/github/repositories/${owner}/${repo}/generate-docs`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to generate documentation")
      }

      const data = await response.json()
      setGeneratedDocs(data)
      setEditedDocs(data.documentation)
      setActiveTab("preview")
    } catch (error) {
      console.error("Error generating documentation:", error)
      toast({
        title: "Error",
        description: "Failed to generate documentation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editedDocs : generatedDocs?.documentation || "")
      toast({
        title: "Copied!",
        description: "Documentation copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const downloadMarkdown = () => {
    const content = isEditing ? editedDocs : generatedDocs?.documentation || ""
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${generatedDocs?.repository.name || "documentation"}-README.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded!",
      description: "Documentation saved as README.md",
    })
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
    if (generatedDocs) {
      setGeneratedDocs({
        ...generatedDocs,
        documentation: editedDocs,
      })
    }
    toast({
      title: "Saved!",
      description: "Your changes have been saved.",
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setGeneratedDocs(null)
      setEditedDocs("")
      setIsEditing(false)
      setActiveTab("preview")
    }
    onOpenChange(open)
  }

  // Auto-generate when modal opens
  if (isOpen && !generatedDocs && !loading) {
    generateDocumentation()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentation Generator
          </DialogTitle>
          <DialogDescription>
            AI-generated documentation for {repositoryId}. Review, edit, and download your documentation.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Analyzing repository and generating documentation...</p>
            </div>
          </div>
        ) : generatedDocs ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="analysis" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Analysis
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadMarkdown}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                {isEditing && (
                  <Button size="sm" onClick={handleSaveEdit}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                )}
              </div>
            </div>

            <Tabs value={activeTab} className="flex-1 flex flex-col min-h-0">
              <TabsContent value="preview" className="flex-1 mt-0">
                <ScrollArea className="h-[500px] border rounded-lg p-4">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {isEditing ? editedDocs : generatedDocs.documentation}
                    </pre>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="edit" className="flex-1 mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Edit the generated documentation to match your needs.
                    </p>
                    {!isEditing && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Start Editing
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={editedDocs}
                    onChange={(e) => setEditedDocs(e.target.value)}
                    className="min-h-[450px] font-mono text-sm"
                    placeholder="Your documentation will appear here..."
                    disabled={!isEditing}
                  />
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="flex-1 mt-0">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Repository Analysis</CardTitle>
                        <CardDescription>Automated analysis of {generatedDocs.repository.full_name}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Languages</h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(generatedDocs.analysis.languages).map(([lang, bytes]) => {
                              const total = Object.values(generatedDocs.analysis.languages).reduce(
                                (sum, b) => sum + b,
                                0,
                              )
                              const percentage = ((bytes / total) * 100).toFixed(1)
                              return (
                                <Badge key={lang} variant="secondary">
                                  {lang} ({percentage}%)
                                </Badge>
                              )
                            })}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Detected Features</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  generatedDocs.analysis.hasReadme ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                              README file
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  generatedDocs.analysis.hasTests ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                              Test suite
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  generatedDocs.analysis.hasDocumentation ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                              Documentation
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  generatedDocs.analysis.hasCICD ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                              CI/CD workflows
                            </div>
                          </div>
                        </div>

                        {(generatedDocs.analysis.packageManager || generatedDocs.analysis.framework) && (
                          <div>
                            <h4 className="font-medium mb-2">Technology Stack</h4>
                            <div className="space-y-1 text-sm">
                              {generatedDocs.analysis.packageManager && (
                                <p>
                                  <span className="text-muted-foreground">Package Manager:</span>{" "}
                                  {generatedDocs.analysis.packageManager}
                                </p>
                              )}
                              {generatedDocs.analysis.framework && (
                                <p>
                                  <span className="text-muted-foreground">Framework:</span>{" "}
                                  {generatedDocs.analysis.framework}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="font-medium mb-2">Project Structure</h4>
                          <div className="bg-muted rounded-lg p-3 font-mono text-xs">
                            {generatedDocs.analysis.structure.slice(0, 15).map((item, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <span className="text-muted-foreground">
                                  {index === generatedDocs.analysis.structure.length - 1 ? "└──" : "├──"}
                                </span>
                                <span>
                                  {item.name}
                                  {item.type === "dir" ? "/" : ""}
                                </span>
                              </div>
                            ))}
                            {generatedDocs.analysis.structure.length > 15 && (
                              <div className="text-muted-foreground">
                                └── ... and {generatedDocs.analysis.structure.length - 15} more items
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Click generate to create documentation for this repository.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
