"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { GitHubAuthModal } from "@/components/github-auth-modal"
import { Code, Github, LayoutDashboard, FileCode, History, Settings, LogOut, Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: ReactNode
  user?: {
    name: string | null
    login: string
    avatar_url: string
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Repositories", href: "/repositories", icon: Github },
    { name: "Generated Files", href: "/generated", icon: FileCode },
    { name: "History", href: "/history", icon: History },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* GitHub Auth Modal */}
      <GitHubAuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />

      {/* Mobile Header */}
      <header className="lg:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FlowDoc AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="px-2 py-6 border-b">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                          <Code className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold">FlowDoc AI</span>
                      </div>
                      <ThemeToggle />
                    </div>
                    {user && (
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.login} />
                          <AvatarFallback>{user.name?.[0] || user.login[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name || user.login}</div>
                          <div className="text-sm text-muted-foreground">@{user.login}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <nav className="flex-1 px-2 py-4 space-y-1">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                          )}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </Link>
                      )
                    })}
                  </nav>
                  <div className="px-2 py-4 border-t">
                    <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleLogout}>
                      <LogOut className="mr-3 h-5 w-5" />
                      Log out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar (desktop) */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center h-16 px-4 border-b">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">FlowDoc AI</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              {user && (
                <div className="px-4 py-4 border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.login} />
                      <AvatarFallback>{user.name?.[0] || user.login[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name || user.login}</div>
                      <div className="text-sm text-muted-foreground">@{user.login}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs w-full justify-start text-muted-foreground"
                    onClick={() => setIsAuthModalOpen(true)}
                  >
                    <Github className="mr-1 h-3 w-3" />
                    Reconnect GitHub
                  </Button>
                </div>
              )}
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="p-4 border-t flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex-1">
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
