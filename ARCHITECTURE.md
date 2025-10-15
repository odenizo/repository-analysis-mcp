# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Repository Analysis MCP                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           Input Sources                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  • GitHub Repositories (via URL)                                        │
│  • repositories.json (batch processing)                                 │
│  • Manual CLI commands                                                  │
│  • GitHub Workflows (scheduled/manual)                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Processing Pipeline                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────┐      ┌──────────────────┐      ┌──────────────┐  │
│  │  1. Clone Repo   │ ───▶ │  2. Run Repomix  │ ───▶ │  3. Store in │  │
│  │                  │      │                  │      │  Database    │  │
│  └──────────────────┘      └──────────────────┘      └──────────────┘  │
│                                                                           │
│  ┌──────────────────┐      ┌──────────────────┐      ┌──────────────┐  │
│  │  4. LLM Analysis │ ───▶ │  5. Categorize   │ ───▶ │  6. Extract  │  │
│  │                  │      │                  │      │  Tools       │  │
│  └──────────────────┘      └──────────────────┘      └──────────────┘  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Core Components                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Database Layer (SQLite)                      │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  • repositories      • tools            • categories            │   │
│  │  • analysis_results  • comparisons                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  Repomix Processor                               │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  • Clone repositories                                            │   │
│  │  • Generate repomix outputs                                      │   │
│  │  • Fallback to basic output                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    LLM Analyzer                                  │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  • Categorize repositories                                       │   │
│  │  • Extract tools                                                 │   │
│  │  • Compare repositories                                          │   │
│  │  • Generate recommendations                                      │   │
│  │  • Simulation mode (no API key)                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Analysis Pipeline                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────┐      ┌──────────────────┐      ┌──────────────┐  │
│  │  Group by        │ ───▶ │  Compare within  │ ───▶ │  Generate    │  │
│  │  Category        │      │  Categories      │      │  Reports     │  │
│  └──────────────────┘      └──────────────────┘      └──────────────┘  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            Outputs                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  • SQLite Database (repositories.db)                                    │
│  • Repomix Outputs (repomix-outputs/)                                   │
│  • Analysis Reports (markdown/JSON)                                     │
│  • Comparisons by Category                                              │
│  • Recommendations                                                      │
│  • GitHub Workflow Artifacts                                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         User Interfaces                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  • CLI (Command Line Interface)                                         │
│  • GitHub Workflows (Automation)                                        │
│  • Programmatic API (JavaScript/Node.js)                                │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Repository Processing

```
GitHub URL ──▶ Clone ──▶ Repomix ──▶ Store Output ──▶ Database
                                            │
                                            ▼
                                      LLM Analysis
                                            │
                                    ┌───────┴───────┐
                                    ▼               ▼
                              Categorization   Tool Extraction
                                    │               │
                                    └───────┬───────┘
                                            ▼
                                       Database
```

### 2. Multi-Repository Analysis

```
Database ──▶ Query All Repos ──▶ Group by Category ──▶ Compare
                                                            │
                                                            ▼
                                                    Generate Report
                                                            │
                                                    ┌───────┴───────┐
                                                    ▼               ▼
                                               Comparisons    Recommendations
```

## Components Detail

### Database Schema

```sql
repositories
├── id (PRIMARY KEY)
├── name
├── url (UNIQUE)
├── description
├── processed_at
├── repomix_output (TEXT)
├── category
└── metadata (JSON)

tools
├── id (PRIMARY KEY)
├── repository_id (FOREIGN KEY)
├── name
├── description
├── type
└── metadata (JSON)

categories
├── id (PRIMARY KEY)
├── name (UNIQUE)
├── description
└── created_at

analysis_results
├── id (PRIMARY KEY)
├── repository_id (FOREIGN KEY)
├── analysis_type
├── result (TEXT)
├── score
└── analyzed_at

comparisons
├── id (PRIMARY KEY)
├── category
├── repository_ids (JSON)
├── comparison_result (TEXT)
├── recommendations (TEXT)
└── compared_at
```

### Module Structure

```
src/
├── database/
│   └── db.js                    # Database operations
│
├── utils/
│   └── repomix.js              # Repomix integration
│
├── analysis/
│   └── llm-analyzer.js         # LLM analysis & simulation
│
├── process-repository.js       # Single repo processing
├── analyze-repositories.js     # Multi-repo analysis
└── index.js                    # Main CLI application
```

### Workflow Execution

```
GitHub Actions Trigger
        │
        ▼
┌───────────────┐
│ Setup Node.js │
└───────┬───────┘
        ▼
┌────────────────┐
│ Install deps   │
└───────┬────────┘
        ▼
┌────────────────┐
│ Process Repos  │
└───────┬────────┘
        ▼
┌────────────────┐
│ Run Analysis   │
└───────┬────────┘
        ▼
┌────────────────┐
│ Generate Report│
└───────┬────────┘
        ▼
┌────────────────┐
│ Upload Artifact│
└────────────────┘
```

## Categories

The system categorizes repositories into:

- **web-scraping**: Web scraping and crawling tools
- **data-processing**: Data transformation and ETL
- **api-integration**: REST/GraphQL API clients
- **database**: Database integrations
- **file-management**: File system operations
- **cloud-services**: AWS, Azure, GCP integrations
- **ai-ml**: AI and machine learning tools
- **developer-tools**: Development utilities
- **communication**: Messaging and notifications
- **other**: Uncategorized

## Extension Points

### Adding New Analysis Types

```javascript
// In src/analysis/llm-analyzer.js
async customAnalysis(repomixOutput, repositoryName) {
  // Your custom analysis logic
  return result;
}
```

### Adding New Database Tables

```javascript
// In src/database/db.js
initSchema() {
  this.db.exec(`
    CREATE TABLE IF NOT EXISTS your_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      // your columns
    )
  `);
}
```

### Adding New Workflows

Create a new YAML file in `.github/workflows/`:

```yaml
name: Your Workflow
on: [workflow_dispatch]
jobs:
  your-job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Your steps
```

## Performance Considerations

- **Database**: SQLite is fast for single-user scenarios; consider PostgreSQL for multi-user
- **LLM Calls**: Rate-limited; batch processing may take time
- **Repomix**: Resource-intensive for large repos; adjust memory limits if needed
- **Concurrency**: Currently sequential; can be parallelized for batch processing

## Security Considerations

- **API Keys**: Store in environment variables or GitHub Secrets
- **Database**: Contains repository content; protect access
- **Repomix Outputs**: May contain sensitive code; handle appropriately
- **Temporary Files**: Cleaned up after processing

## Scalability

For large-scale usage:
1. Use a production database (PostgreSQL)
2. Implement caching for repomix outputs
3. Add job queues for batch processing
4. Consider containerization (Docker)
5. Implement rate limiting for LLM calls
6. Add monitoring and logging
