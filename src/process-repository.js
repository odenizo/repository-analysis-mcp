import { RepositoryDatabase } from './database/db.js';
import { RepomixProcessor } from './utils/repomix.js';
import { LLMAnalyzer } from './analysis/llm-analyzer.js';

/**
 * Main processing pipeline for a repository
 */
export async function processRepository(repoUrl, repoName, description = '') {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Processing repository: ${repoName}`);
  console.log(`URL: ${repoUrl}`);
  console.log(`${'='.repeat(80)}\n`);

  const db = new RepositoryDatabase();
  const repomix = new RepomixProcessor();
  const analyzer = new LLMAnalyzer();

  try {
    // Step 1: Add repository to database
    console.log('Step 1: Adding repository to database...');
    let repoId;
    try {
      const result = db.addRepository(repoName, repoUrl, description);
      repoId = result.lastInsertRowid;
      console.log(`✓ Repository added with ID: ${repoId}`);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        console.log('Repository already exists, fetching existing record...');
        const repos = db.getAllRepositories();
        const existing = repos.find(r => r.url === repoUrl);
        repoId = existing.id;
        console.log(`✓ Using existing repository ID: ${repoId}`);
      } else {
        throw error;
      }
    }

    // Step 2: Process with repomix
    console.log('\nStep 2: Processing with repomix...');
    const outputFile = await repomix.processRepository(repoUrl, repoName);
    const repomixOutput = repomix.readRepomixOutput(outputFile);
    db.updateRepomixOutput(repoId, repomixOutput);
    console.log(`✓ Repomix output saved (${repomixOutput.length} bytes)`);

    // Step 3: Categorize with LLM
    console.log('\nStep 3: Categorizing repository with LLM...');
    const categorization = await analyzer.categorizeRepository(repomixOutput, repoName);
    const category = categorization.split('\n')[0].trim();
    db.updateCategory(repoId, category);
    db.addAnalysisResult(repoId, 'categorization', categorization);
    console.log(`✓ Category: ${category}`);

    // Step 4: Extract tools
    console.log('\nStep 4: Extracting tools and functionalities...');
    const tools = await analyzer.extractTools(repomixOutput, repoName);
    for (const tool of tools) {
      db.addTool(repoId, tool.name, tool.description, tool.type);
    }
    console.log(`✓ Extracted ${tools.length} tools`);

    // Step 5: Store metadata
    console.log('\nStep 5: Storing analysis results...');
    db.addAnalysisResult(repoId, 'tool_extraction', JSON.stringify(tools));
    console.log('✓ Analysis complete');

    console.log(`\n${'='.repeat(80)}`);
    console.log(`Successfully processed: ${repoName}`);
    console.log(`${'='.repeat(80)}\n`);

    return {
      success: true,
      repositoryId: repoId,
      category,
      toolsCount: tools.length
    };
  } catch (error) {
    console.error(`\n✗ Error processing repository: ${error.message}`);
    console.error(error.stack);
    return {
      success: false,
      error: error.message
    };
  } finally {
    db.close();
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node src/process-repository.js <repo-url> <repo-name> [description]');
    console.log('\nExample:');
    console.log('  node src/process-repository.js https://github.com/user/repo my-repo "Description"');
    process.exit(1);
  }

  const [repoUrl, repoName, description] = args;
  processRepository(repoUrl, repoName, description || '')
    .then(result => {
      if (result.success) {
        console.log('\n✓ Processing completed successfully');
        process.exit(0);
      } else {
        console.error('\n✗ Processing failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default processRepository;
