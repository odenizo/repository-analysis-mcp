import { RepositoryDatabase } from './database/db.js';
import { processRepository } from './process-repository.js';
import { analyzeRepositories, getCategoryReport, getAllToolsList } from './analyze-repositories.js';

/**
 * Main application entry point
 */
class RepositoryAnalysisMCP {
  constructor() {
    this.db = new RepositoryDatabase();
  }

  /**
   * Process a single repository
   */
  async process(repoUrl, repoName, description = '') {
    return await processRepository(repoUrl, repoName, description);
  }

  /**
   * Process multiple repositories
   */
  async processBatch(repositories) {
    const results = [];
    for (const repo of repositories) {
      console.log(`\nProcessing ${repo.name}...`);
      const result = await processRepository(repo.url, repo.name, repo.description || '');
      results.push({ ...repo, ...result });
    }
    return results;
  }

  /**
   * Analyze all repositories
   */
  async analyze(options = {}) {
    return await analyzeRepositories(options);
  }

  /**
   * Get category report
   */
  async getCategoryReport(category) {
    return await getCategoryReport(category);
  }

  /**
   * Get all tools
   */
  async getAllTools() {
    return await getAllToolsList();
  }

  /**
   * List all repositories
   */
  listRepositories() {
    return this.db.getAllRepositories();
  }

  /**
   * List all categories
   */
  listCategories() {
    return this.db.getAllCategories();
  }

  /**
   * Close database connection
   */
  close() {
    this.db.close();
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0];

  const app = new RepositoryAnalysisMCP();

  const commands = {
    help: async () => {
      console.log(`
Repository Analysis MCP - Command Line Interface

Usage: node src/index.js <command> [options]

Commands:
  process <url> <name> [description]  Process a single repository
  batch <json-file>                   Process multiple repositories from JSON file
  analyze [--needs "description"]     Analyze all repositories and generate report
  list                                List all repositories
  categories                          List all categories
  tools                               List all tools
  category <name>                     Get report for specific category
  help                                Show this help message

Examples:
  node src/index.js process https://github.com/user/repo my-repo "Description"
  node src/index.js batch repositories.json
  node src/index.js analyze --needs "web scraping tools"
  node src/index.js list
  node src/index.js category web-scraping

Environment Variables:
  OPENAI_API_KEY                      OpenAI API key for LLM analysis (optional)
`);
    },

    process: async () => {
      if (args.length < 3) {
        console.error('Error: Missing arguments');
        console.log('Usage: node src/index.js process <url> <name> [description]');
        process.exit(1);
      }
      const [, url, name, description] = args;
      const result = await app.process(url, name, description || '');
      console.log('\nResult:', result);
    },

    batch: async () => {
      if (args.length < 2) {
        console.error('Error: Missing JSON file');
        console.log('Usage: node src/index.js batch <json-file>');
        process.exit(1);
      }
      const { readFileSync } = await import('fs');
      const repositories = JSON.parse(readFileSync(args[1], 'utf-8'));
      const results = await app.processBatch(repositories);
      console.log('\nBatch Results:', results);
    },

    analyze: async () => {
      const options = {};
      const needsIndex = args.indexOf('--needs');
      if (needsIndex >= 0 && args[needsIndex + 1]) {
        options.userNeeds = args[needsIndex + 1];
      }
      const result = await app.analyze(options);
      console.log('\nAnalysis:', result);
    },

    list: async () => {
      const repos = app.listRepositories();
      console.log('\nRepositories:');
      console.table(repos.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category || 'uncategorized',
        url: r.url
      })));
    },

    categories: async () => {
      const categories = app.listCategories();
      console.log('\nCategories:');
      console.table(categories);
    },

    tools: async () => {
      const tools = await app.getAllTools();
      console.log('\nTools:', JSON.stringify(tools, null, 2));
    },

    category: async () => {
      if (args.length < 2) {
        console.error('Error: Missing category name');
        console.log('Usage: node src/index.js category <name>');
        process.exit(1);
      }
      const report = await app.getCategoryReport(args[1]);
      console.log('\nCategory Report:', JSON.stringify(report, null, 2));
    }
  };

  const handler = commands[command] || commands.help;
  
  handler()
    .then(() => {
      app.close();
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      app.close();
      process.exit(1);
    });
}

export default RepositoryAnalysisMCP;
export { RepositoryAnalysisMCP };
