import { type NextRequest, NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

interface FileStructure {
  name: string
  path: string
  type: "file" | "dir"
  size?: number
  children?: FileStructure[]
}

interface RepositoryAnalysis {
  languages: Record<string, number>
  structure: FileStructure[]
  hasReadme: boolean
  hasTests: boolean
  hasDocumentation: boolean
  hasCICD: boolean
  packageManager: string | null
  framework: string | null
}

async function analyzeRepository(owner: string, repo: string, accessToken: string): Promise<RepositoryAnalysis> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "FlowDoc-AI",
  }

  // Get repository languages
  const languagesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers })
  const languages = languagesResponse.ok ? await languagesResponse.json() : {}

  // Get repository contents
  const contentsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers })
  const contents = contentsResponse.ok ? await contentsResponse.json() : []

  // Analyze structure
  const structure: FileStructure[] = Array.isArray(contents)
    ? contents.map((item: any) => ({
        name: item.name,
        path: item.path,
        type: item.type,
        size: item.size,
      }))
    : []

  // Detect patterns
  const fileNames = structure.map((f) => f.name.toLowerCase())
  const hasReadme = fileNames.some((name) => name.startsWith("readme"))
  const hasTests = fileNames.some((name) => name.includes("test") || name === "tests" || name === "__tests__")
  const hasDocumentation = fileNames.some((name) => name === "docs" || name === "documentation")
  const hasCICD = fileNames.some((name) => name === ".github") || structure.some((f) => f.name === ".github")

  // Detect package manager and framework
  let packageManager: string | null = null
  let framework: string | null = null

  if (fileNames.includes("package.json")) {
    packageManager = "npm"
    // Could fetch package.json to detect framework
  } else if (fileNames.includes("requirements.txt") || fileNames.includes("pyproject.toml")) {
    packageManager = "pip"
  } else if (fileNames.includes("composer.json")) {
    packageManager = "composer"
  } else if (fileNames.includes("cargo.toml")) {
    packageManager = "cargo"
  }

  // Detect framework based on files and languages
  const primaryLanguage = Object.keys(languages)[0]
  if (primaryLanguage === "JavaScript" || primaryLanguage === "TypeScript") {
    if (fileNames.includes("next.config.js") || fileNames.includes("next.config.mjs")) {
      framework = "Next.js"
    } else if (fileNames.includes("nuxt.config.js")) {
      framework = "Nuxt.js"
    } else if (fileNames.includes("vue.config.js")) {
      framework = "Vue.js"
    } else if (fileNames.includes("angular.json")) {
      framework = "Angular"
    } else if (fileNames.includes("svelte.config.js")) {
      framework = "Svelte"
    }
  } else if (primaryLanguage === "Python") {
    if (fileNames.includes("manage.py")) {
      framework = "Django"
    } else if (fileNames.includes("app.py") || fileNames.includes("main.py")) {
      framework = "Flask/FastAPI"
    }
  }

  return {
    languages,
    structure,
    hasReadme,
    hasTests,
    hasDocumentation,
    hasCICD,
    packageManager,
    framework,
  }
}

function generateDocumentation(repository: any, analysis: RepositoryAnalysis): string {
  const { languages, structure, hasReadme, hasTests, hasDocumentation, hasCICD, packageManager, framework } = analysis

  const primaryLanguage = Object.keys(languages)[0] || "Unknown"
  const totalBytes = Object.values(languages).reduce((sum: number, bytes: number) => sum + bytes, 0)
  const languagePercentages = Object.entries(languages)
    .map(([lang, bytes]) => ({
      language: lang,
      percentage: (((bytes as number) / totalBytes) * 100).toFixed(1),
    }))
    .sort((a, b) => Number.parseFloat(b.percentage) - Number.parseFloat(a.percentage))

  const documentation = `# ${repository.name}

${repository.description || "A software project"}

## 📋 Overview

This repository contains a ${primaryLanguage} project${framework ? ` built with ${framework}` : ""}. The project was created by [${repository.owner.login}](${repository.owner.html_url}) and is ${repository.private ? "private" : "publicly available"}.

## 🚀 Quick Start

### Prerequisites

${packageManager ? `- ${packageManager === "npm" ? "Node.js and npm" : packageManager === "pip" ? "Python and pip" : packageManager === "composer" ? "PHP and Composer" : packageManager === "cargo" ? "Rust and Cargo" : packageManager}` : "- Check the project files for specific requirements"}

### Installation

\`\`\`bash
# Clone the repository
git clone ${repository.clone_url}
cd ${repository.name}

${
  packageManager === "npm"
    ? `# Install dependencies
npm install

# Start development server
npm run dev`
    : packageManager === "pip"
      ? `# Install dependencies
pip install -r requirements.txt

# Run the application
python main.py`
      : packageManager === "composer"
        ? `# Install dependencies
composer install`
        : packageManager === "cargo"
          ? `# Build the project
cargo build

# Run the project
cargo run`
          : "# Follow project-specific installation instructions"
}
\`\`\`

## 📁 Project Structure

\`\`\`
${repository.name}/
${structure
  .slice(0, 10)
  .map((item) => `├── ${item.name}${item.type === "dir" ? "/" : ""}`)
  .join("\n")}
${structure.length > 10 ? "└── ..." : ""}
\`\`\`

## 🛠 Technology Stack

### Languages
${languagePercentages.map(({ language, percentage }) => `- **${language}**: ${percentage}%`).join("\n")}

### Key Features
${hasTests ? "- ✅ Test suite included" : "- ❌ No tests detected"}
${hasDocumentation ? "- ✅ Documentation available" : "- ❌ Limited documentation"}
${hasCICD ? "- ✅ CI/CD workflows configured" : "- ❌ No CI/CD detected"}
${framework ? `- ✅ Built with ${framework}` : ""}

## 📊 Repository Stats

- **Stars**: ${repository.stargazers_count}
- **Forks**: ${repository.forks_count}
- **Watchers**: ${repository.watchers_count}
- **Size**: ${(repository.size / 1024).toFixed(1)} MB
- **Created**: ${new Date(repository.created_at).toLocaleDateString()}
- **Last Updated**: ${new Date(repository.updated_at).toLocaleDateString()}

## 🤝 Contributing

${
  hasTests
    ? `1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Make your changes
4. Run tests to ensure everything works
5. Commit your changes (\`git commit -m 'Add amazing feature'\`)
6. Push to the branch (\`git push origin feature/amazing-feature\`)
7. Open a Pull Request`
    : `1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes
5. Push to the branch
6. Open a Pull Request`
}

## 📄 License

${repository.license ? `This project is licensed under the ${repository.license.name} License.` : "License information not available. Please check the repository for license details."}

## 👤 Author

**${repository.owner.login}**
- GitHub: [@${repository.owner.login}](${repository.owner.html_url})

## 🔗 Links

- [Repository](${repository.html_url})
- [Issues](${repository.html_url}/issues)
- [Pull Requests](${repository.html_url}/pulls)

---

*This documentation was automatically generated by FlowDoc AI. Last updated: ${new Date().toLocaleDateString()}*
`

  return documentation
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ owner: string; repo: string }> }) {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { owner, repo } = await params

    // Get repository details
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "FlowDoc-AI",
      },
    })

    if (!repoResponse.ok) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    const repository = await repoResponse.json()

    // Analyze repository
    const analysis = await analyzeRepository(owner, repo, session.accessToken)

    // Generate documentation
    const documentation = generateDocumentation(repository, analysis)

    return NextResponse.json({
      documentation,
      analysis,
      repository: {
        name: repository.name,
        full_name: repository.full_name,
        description: repository.description,
        owner: repository.owner,
      },
    })
  } catch (error) {
    console.error("Documentation generation error:", error)
    return NextResponse.json({ error: "Failed to generate documentation" }, { status: 500 })
  }
}
