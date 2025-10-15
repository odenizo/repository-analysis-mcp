import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

export class RepomixProcessor {
  constructor(outputDir = './repomix-outputs') {
    this.outputDir = outputDir;
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
  }

  /**
   * Process a repository with repomix
   * @param {string} repoUrl - GitHub repository URL
   * @param {string} repoName - Repository name for output file
   * @returns {Promise<string>} - Path to the generated repomix output
   */
  async processRepository(repoUrl, repoName) {
    try {
      // Clone the repository to a temporary directory
      const tempDir = join('/tmp', `repo-${Date.now()}`);
      console.log(`Cloning repository: ${repoUrl}`);
      await execAsync(`git clone --depth 1 ${repoUrl} ${tempDir}`);

      // Run repomix on the cloned repository
      const outputFile = join(this.outputDir, `${repoName}.txt`);
      console.log(`Running repomix on: ${tempDir}`);
      
      try {
        await execAsync(`npx repomix ${tempDir} -o ${outputFile}`);
      } catch (error) {
        // If repomix is not available, create a basic output
        console.warn('Repomix not available, creating basic output');
        await this.createBasicOutput(tempDir, outputFile);
      }

      // Clean up temporary directory
      await execAsync(`rm -rf ${tempDir}`);

      console.log(`Repomix output saved to: ${outputFile}`);
      return outputFile;
    } catch (error) {
      console.error(`Error processing repository ${repoName}:`, error.message);
      throw error;
    }
  }

  /**
   * Create a basic output file if repomix is not available
   */
  async createBasicOutput(repoDir, outputFile) {
    try {
      // Get list of files
      const { stdout: files } = await execAsync(
        `find ${repoDir} -type f -not -path "*/\\.git/*" -not -path "*/node_modules/*"`
      );
      
      let output = `Repository Analysis Output\n`;
      output += `Generated at: ${new Date().toISOString()}\n`;
      output += `\n${'='.repeat(80)}\n\n`;
      
      const fileList = files.trim().split('\n').filter(f => f);
      output += `Total files: ${fileList.length}\n\n`;
      
      // Read package.json if exists
      const packageJsonPath = join(repoDir, 'package.json');
      if (existsSync(packageJsonPath)) {
        output += `\npackage.json:\n`;
        output += `${'-'.repeat(80)}\n`;
        output += readFileSync(packageJsonPath, 'utf-8');
        output += `\n${'='.repeat(80)}\n\n`;
      }

      // Read README if exists
      const readmePath = join(repoDir, 'README.md');
      if (existsSync(readmePath)) {
        output += `\nREADME.md:\n`;
        output += `${'-'.repeat(80)}\n`;
        output += readFileSync(readmePath, 'utf-8');
        output += `\n${'='.repeat(80)}\n\n`;
      }

      writeFileSync(outputFile, output);
    } catch (error) {
      console.error('Error creating basic output:', error);
      writeFileSync(outputFile, `Error processing repository: ${error.message}`);
    }
  }

  /**
   * Read repomix output from file
   */
  readRepomixOutput(filePath) {
    if (!existsSync(filePath)) {
      throw new Error(`Repomix output file not found: ${filePath}`);
    }
    return readFileSync(filePath, 'utf-8');
  }

  /**
   * Get all processed repositories
   */
  getProcessedRepositories() {
    if (!existsSync(this.outputDir)) {
      return [];
    }
    return readdirSync(this.outputDir)
      .filter(file => file.endsWith('.txt'))
      .map(file => file.replace('.txt', ''));
  }
}

export default RepomixProcessor;
