import { RepositoryDatabase } from './database/db.js';
import { LLMAnalyzer } from './analysis/llm-analyzer.js';

/**
 * Analyze multiple repositories and generate comparisons
 */
export async function analyzeRepositories(options = {}) {
  console.log(`\n${'='.repeat(80)}`);
  console.log('Multi-Repository Analysis');
  console.log(`${'='.repeat(80)}\n`);

  const db = new RepositoryDatabase();
  const analyzer = new LLMAnalyzer();

  try {
    // Get all repositories
    const repositories = db.getAllRepositories();
    console.log(`Found ${repositories.length} repositories in database\n`);

    if (repositories.length === 0) {
      console.log('No repositories to analyze. Please process some repositories first.');
      return { success: false, message: 'No repositories found' };
    }

    // Group by category
    const categorizedRepos = {};
    for (const repo of repositories) {
      const category = repo.category || 'uncategorized';
      if (!categorizedRepos[category]) {
        categorizedRepos[category] = [];
      }
      categorizedRepos[category].push(repo);
    }

    console.log('Categories found:');
    for (const [category, repos] of Object.entries(categorizedRepos)) {
      console.log(`  - ${category}: ${repos.length} repositories`);
      db.addCategory(category, `Repositories categorized as ${category}`);
    }
    console.log('');

    // Analyze each category
    const categoryAnalyses = {};
    for (const [category, repos] of Object.entries(categorizedRepos)) {
      if (repos.length > 1) {
        console.log(`\nAnalyzing category: ${category}`);
        console.log(`${'-'.repeat(80)}`);
        
        const comparison = await analyzer.compareRepositories(repos, category);
        categoryAnalyses[category] = comparison;
        
        console.log(comparison);
        console.log('');

        // Store comparison in database
        const repoIds = repos.map(r => r.id);
        db.addComparison(category, repoIds, comparison, '');
      } else {
        console.log(`\nCategory "${category}" has only 1 repository, skipping comparison`);
      }
    }

    // Generate overall recommendations
    console.log(`\n${'='.repeat(80)}`);
    console.log('Generating Overall Recommendations');
    console.log(`${'='.repeat(80)}\n`);

    const allTools = db.getAllTools();
    console.log(`Total tools across all repositories: ${allTools.length}\n`);

    // Group tools by type
    const toolsByType = {};
    for (const tool of allTools) {
      const type = tool.type || 'unknown';
      if (!toolsByType[type]) {
        toolsByType[type] = [];
      }
      toolsByType[type].push(tool);
    }

    console.log('Tools by type:');
    for (const [type, tools] of Object.entries(toolsByType)) {
      console.log(`  - ${type}: ${tools.length} tools`);
    }
    console.log('');

    // Generate recommendations
    const recommendations = await analyzer.generateRecommendations({
      categories: Object.keys(categorizedRepos),
      repositoryCount: repositories.length,
      toolCount: allTools.length,
      categoryAnalyses
    }, options.userNeeds);

    console.log('Recommendations:');
    console.log(`${'-'.repeat(80)}`);
    console.log(recommendations);
    console.log('');

    // Generate summary report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalRepositories: repositories.length,
        totalTools: allTools.length,
        categories: Object.keys(categorizedRepos).length,
        categoriesDetail: Object.entries(categorizedRepos).map(([name, repos]) => ({
          name,
          count: repos.length,
          repositories: repos.map(r => ({ id: r.id, name: r.name, url: r.url }))
        }))
      },
      comparisons: categoryAnalyses,
      recommendations
    };

    console.log(`\n${'='.repeat(80)}`);
    console.log('Analysis Complete');
    console.log(`${'='.repeat(80)}\n`);

    return {
      success: true,
      report
    };
  } catch (error) {
    console.error('Error during analysis:', error.message);
    console.error(error.stack);
    return {
      success: false,
      error: error.message
    };
  } finally {
    db.close();
  }
}

/**
 * Get analysis report for a specific category
 */
export async function getCategoryReport(category) {
  const db = new RepositoryDatabase();
  
  try {
    const repositories = db.getRepositoriesByCategory(category);
    const comparisons = db.getComparisonsByCategory(category);
    
    const tools = [];
    for (const repo of repositories) {
      const repoTools = db.getToolsByRepository(repo.id);
      tools.push(...repoTools);
    }

    return {
      category,
      repositoryCount: repositories.length,
      repositories,
      toolCount: tools.length,
      tools,
      comparisons
    };
  } finally {
    db.close();
  }
}

/**
 * Get all tools list
 */
export async function getAllToolsList() {
  const db = new RepositoryDatabase();
  
  try {
    const tools = db.getAllTools();
    
    // Group by repository
    const byRepository = {};
    for (const tool of tools) {
      const repoName = tool.repository_name;
      if (!byRepository[repoName]) {
        byRepository[repoName] = {
          repository: repoName,
          url: tool.repository_url,
          tools: []
        };
      }
      byRepository[repoName].tools.push({
        name: tool.name,
        description: tool.description,
        type: tool.type
      });
    }

    return {
      totalTools: tools.length,
      repositories: Object.values(byRepository)
    };
  } finally {
    db.close();
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'report' && args[1]) {
    // Get category report
    getCategoryReport(args[1])
      .then(report => {
        console.log(JSON.stringify(report, null, 2));
        process.exit(0);
      })
      .catch(error => {
        console.error('Error:', error);
        process.exit(1);
      });
  } else if (command === 'tools') {
    // Get all tools list
    getAllToolsList()
      .then(list => {
        console.log(JSON.stringify(list, null, 2));
        process.exit(0);
      })
      .catch(error => {
        console.error('Error:', error);
        process.exit(1);
      });
  } else {
    // Run full analysis
    const options = {};
    const needsIndex = args.indexOf('--needs');
    if (needsIndex >= 0 && args[needsIndex + 1]) {
      options.userNeeds = args[needsIndex + 1];
    }

    analyzeRepositories(options)
      .then(result => {
        if (result.success) {
          process.exit(0);
        } else {
          process.exit(1);
        }
      })
      .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
      });
  }
}

export default analyzeRepositories;
