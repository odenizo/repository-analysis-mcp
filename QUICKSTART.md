# Quick Start Guide

Get started with Repository Analysis MCP in 5 minutes!

## Prerequisites

- Node.js 20 or later
- Git
- (Optional) OpenAI API key for LLM-powered analysis

## Installation

```bash
# Clone the repository
git clone https://github.com/odenizo/repository-analysis-mcp.git
cd repository-analysis-mcp

# Install dependencies
npm install

# (Optional) Install repomix globally
npm install -g repomix
```

## Basic Usage

### 1. Process Your First Repository

```bash
node src/process-repository.js \
  https://github.com/modelcontextprotocol/servers \
  mcp-servers \
  "Official MCP servers"
```

This will:
- Clone the repository
- Generate a repomix output
- Analyze and categorize it
- Extract tools and functionalities
- Store everything in the database

### 2. View Results

```bash
# List all repositories
node src/index.js list

# View all tools
node src/index.js tools

# View categories
node src/index.js categories
```

### 3. Process Multiple Repositories

Edit `repositories.json` to add repositories you want to analyze:

```json
[
  {
    "name": "my-mcp-server",
    "url": "https://github.com/user/my-mcp-server",
    "description": "My custom MCP server"
  }
]
```

Then process all:

```bash
node src/index.js batch repositories.json
```

### 4. Run Analysis

```bash
# Analyze all repositories
node src/analyze-repositories.js

# With specific needs
node src/analyze-repositories.js --needs "web scraping tools"

# Get category report
node src/analyze-repositories.js report web-scraping
```

## Using with LLM (Optional)

For better analysis results, add your OpenAI API key:

```bash
# Create .env file
cp .env.example .env

# Edit .env and add your key
echo "OPENAI_API_KEY=your-key-here" >> .env
```

Then run the same commands - they'll automatically use the LLM for analysis.

## Demo Script

Run the included demo to see everything in action:

```bash
bash demo.sh
```

This creates a test repository and processes it through the entire pipeline.

## Using GitHub Workflows

### Manual Processing

1. Go to Actions tab in GitHub
2. Select "Process and Analyze Repositories"
3. Click "Run workflow"
4. Enter repository details:
   - Repository URL
   - Repository name
   - (Optional) Description

### Automated Processing

The workflows automatically run:
- **Weekly**: Process repositories from `repositories.json`
- **On Push**: When you update `repositories.json`
- **Daily**: Generate analysis reports

### Setting Up

Add your OpenAI API key to GitHub Secrets:
1. Go to repository Settings
2. Click on Secrets and variables > Actions
3. Click "New repository secret"
4. Name: `OPENAI_API_KEY`
5. Value: Your OpenAI API key

## Output Files

After processing, you'll have:

- `repositories.db` - SQLite database with all data
- `repomix-outputs/` - Directory with repomix outputs
- `reports/` - Generated analysis reports (from workflows)

## Common Commands

```bash
# Show help
node src/index.js help

# Process a repository
node src/index.js process <url> <name> [description]

# Batch process
node src/index.js batch repositories.json

# List repositories
node src/index.js list

# List categories
node src/index.js categories

# Get all tools
node src/index.js tools

# Get category report
node src/index.js category <category-name>

# Analyze all
node src/analyze-repositories.js
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Explore the [workflows](.github/workflows/) for automation ideas
- Customize categories in `src/analysis/llm-analyzer.js`

## Troubleshooting

### "Database is locked"
Close any other processes using the database, or delete `repositories.db` to start fresh.

### "Repomix not found"
Install repomix globally: `npm install -g repomix`

### LLM errors
The system works without an API key using simulation mode. Add `OPENAI_API_KEY` to `.env` for full features.

## Support

- Open an issue on GitHub for bugs
- Check existing issues for solutions
- Read the documentation in `README.md`

Happy analyzing! 🚀
