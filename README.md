# Repository Analysis MCP

A comprehensive system for analyzing MCP (Model Context Protocol) servers and tools using repomix and LLM workflows.

## Overview

This system processes repositories containing MCP servers and tools, generates repomix outputs, stores them in an SQLite database, and uses LLM workflows to:
- Categorize repositories by functionality
- Extract and catalog available tools
- Compare servers within functional categories
- Generate recommendations based on analysis

## Features

- 🔄 **Automated Processing**: GitHub workflows for scheduled and on-demand repository processing
- 📊 **Repomix Integration**: Generates comprehensive repository outputs using repomix
- 💾 **SQLite Database**: Stores all outputs, analysis results, and metadata
- 🤖 **LLM Analysis**: Uses OpenAI API for intelligent categorization and comparison
- 🏷️ **Categorization**: Automatically categorizes repositories into functional buckets
- 🔍 **Tool Extraction**: Identifies and catalogs all tools and functionalities
- 📈 **Comparison**: Compares repositories within the same category
- 💡 **Recommendations**: Generates recommendations based on analysis

## Installation

```bash
# Clone the repository
git clone https://github.com/odenizo/repository-analysis-mcp.git
cd repository-analysis-mcp

# Install dependencies
npm install

# Install repomix globally (optional but recommended)
npm install -g repomix

# Set up environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY (optional)
```

## Usage

### Command Line Interface

```bash
# Show help
node src/index.js help

# Process a single repository
node src/index.js process <repository-url> <name> [description]
node src/index.js process https://github.com/user/repo my-repo "A great MCP server"

# Process multiple repositories from JSON file
node src/index.js batch repositories.json

# Analyze all repositories and generate report
node src/index.js analyze
node src/index.js analyze --needs "web scraping tools"

# List all repositories
node src/index.js list

# List all categories
node src/index.js categories

# Get all tools
node src/index.js tools

# Get report for specific category
node src/index.js category web-scraping
```

### GitHub Workflows

#### Process Repositories

The `process-repositories.yml` workflow can be triggered:
- **Manually**: Use workflow_dispatch to process a single repository
- **On Schedule**: Runs weekly to process repositories from `repositories.json`
- **On Push**: Automatically runs when `repositories.json` is updated

To use manual trigger:
1. Go to Actions tab in GitHub
2. Select "Process and Analyze Repositories"
3. Click "Run workflow"
4. Enter repository details

#### Compare Repositories

The `compare-repositories.yml` workflow:
- **Manually**: Compare repositories in a specific category
- **On Schedule**: Runs monthly to generate comparison reports

### Configuration

#### repositories.json

Create a `repositories.json` file in the root directory with repositories to process:

```json
[
  {
    "name": "mcp-server-example",
    "url": "https://github.com/user/mcp-server",
    "description": "An example MCP server"
  }
]
```

See `repositories.json.example` for a template.

## Architecture

### Components

1. **Database Layer** (`src/database/db.js`)
   - SQLite database with tables for repositories, tools, categories, analysis results, and comparisons
   - CRUD operations for all entities

2. **Repomix Processor** (`src/utils/repomix.js`)
   - Clones repositories and generates repomix outputs
   - Fallback to basic output generation if repomix is unavailable

3. **LLM Analyzer** (`src/analysis/llm-analyzer.js`)
   - Categorization using OpenAI API
   - Tool extraction from repository contents
   - Repository comparison within categories
   - Recommendation generation
   - Simulation mode when API is unavailable

4. **Processing Pipeline** (`src/process-repository.js`)
   - End-to-end processing of single repositories
   - Integration of all components

5. **Analysis Pipeline** (`src/analyze-repositories.js`)
   - Multi-repository analysis
   - Category-based comparison
   - Report generation

6. **Main Application** (`src/index.js`)
   - CLI interface
   - Batch processing
   - Orchestration

### Database Schema

**repositories**
- id, name, url, description, processed_at, repomix_output, category, metadata

**tools**
- id, repository_id, name, description, type, metadata

**categories**
- id, name, description, created_at

**analysis_results**
- id, repository_id, analysis_type, result, score, analyzed_at

**comparisons**
- id, category, repository_ids, comparison_result, recommendations, compared_at

## Categories

The system categorizes repositories into:
- `web-scraping`: Web scraping and crawling tools
- `data-processing`: Data transformation and ETL
- `api-integration`: REST/GraphQL API clients
- `database`: Database integrations
- `file-management`: File system operations
- `cloud-services`: AWS, Azure, GCP integrations
- `ai-ml`: AI and machine learning tools
- `developer-tools`: Development utilities
- `communication`: Messaging and notifications
- `other`: Uncategorized

## Examples

### Processing a Repository

```bash
node src/process-repository.js \
  https://github.com/modelcontextprotocol/servers \
  mcp-servers \
  "Official MCP servers collection"
```

Output:
```
================================================================================
Processing repository: mcp-servers
URL: https://github.com/modelcontextprotocol/servers
================================================================================

Step 1: Adding repository to database...
✓ Repository added with ID: 1

Step 2: Processing with repomix...
✓ Repomix output saved (15234 bytes)

Step 3: Categorizing repository with LLM...
✓ Category: developer-tools

Step 4: Extracting tools and functionalities...
✓ Extracted 12 tools

Step 5: Storing analysis results...
✓ Analysis complete

================================================================================
Successfully processed: mcp-servers
================================================================================
```

### Analyzing All Repositories

```bash
node src/analyze-repositories.js
```

This will:
1. Group repositories by category
2. Compare repositories within each category
3. Generate recommendations
4. Output a comprehensive analysis report

## Programmatic Usage

```javascript
import { RepositoryAnalysisMCP } from './src/index.js';

const app = new RepositoryAnalysisMCP();

// Process a repository
await app.process(
  'https://github.com/user/repo',
  'my-repo',
  'Description'
);

// Process multiple repositories
await app.processBatch([
  { name: 'repo1', url: 'https://github.com/user/repo1' },
  { name: 'repo2', url: 'https://github.com/user/repo2' }
]);

// Analyze all repositories
const analysis = await app.analyze({ userNeeds: 'web scraping' });

// Get tools list
const tools = await app.getAllTools();

// Close database connection
app.close();
```

## GitHub Secrets

For LLM-powered analysis in GitHub workflows, add the following secret:
- `OPENAI_API_KEY`: Your OpenAI API key

Without this secret, the system will operate in simulation mode using keyword-based analysis.

## Artifacts

The workflows generate the following artifacts:
- **repository-database**: SQLite database with all data
- **repomix-outputs**: Generated repomix output files
- **analysis-report**: Comprehensive analysis report
- **comparison-report**: Category comparison reports

Artifacts are retained for 90 days.

## Development

### Project Structure

```
repository-analysis-mcp/
├── .github/
│   └── workflows/           # GitHub workflow definitions
├── src/
│   ├── analysis/            # LLM analysis components
│   ├── database/            # Database layer
│   ├── utils/               # Utility functions
│   ├── index.js             # Main application
│   ├── process-repository.js # Single repository processor
│   └── analyze-repositories.js # Multi-repository analyzer
├── repositories.json        # List of repositories to process
├── package.json
└── README.md
```

### Adding New Features

1. **New Analysis Type**: Add methods to `LLMAnalyzer` class
2. **New Database Table**: Update `RepositoryDatabase.initSchema()`
3. **New Workflow**: Create new workflow in `.github/workflows/`

## Troubleshooting

### Repomix not found
If repomix is not installed, the system will create basic outputs. Install with:
```bash
npm install -g repomix
```

### OpenAI API errors
If you don't have an OpenAI API key, the system will use simulation mode. To enable full LLM features:
1. Get an API key from https://platform.openai.com/
2. Add it to `.env` or GitHub secrets

### Database locked
If you get database locked errors, ensure no other processes are using the database:
```bash
# Check for locks
lsof repositories.db

# If needed, remove the database and reprocess
rm repositories.db
```

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC

## Acknowledgments

- [Repomix](https://github.com/yamadashy/repomix) - Repository to single file converter
- [Model Context Protocol](https://github.com/modelcontextprotocol) - MCP specification and tools
- [OpenAI](https://openai.com/) - LLM API for analysis