import OpenAI from 'openai';

export class LLMAnalyzer {
  constructor(apiKey = process.env.OPENAI_API_KEY) {
    if (!apiKey) {
      console.warn('Warning: OPENAI_API_KEY not set. LLM analysis will be simulated.');
      this.client = null;
    } else {
      this.client = new OpenAI({ apiKey });
    }
  }

  /**
   * Categorize a repository based on its repomix output
   */
  async categorizeRepository(repomixOutput, repositoryName) {
    const prompt = `Analyze the following repository output and categorize it into one of these categories:
- web-scraping
- data-processing
- api-integration
- database
- file-management
- cloud-services
- ai-ml
- developer-tools
- communication
- other

Repository: ${repositoryName}

Output:
${repomixOutput.substring(0, 4000)}

Respond with only the category name and a brief explanation (2-3 sentences).`;

    if (!this.client) {
      // Simulate categorization
      return this.simulateCategorization(repomixOutput, repositoryName);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing code repositories and categorizing them based on their functionality.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 200
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error calling OpenAI API:', error.message);
      return this.simulateCategorization(repomixOutput, repositoryName);
    }
  }

  /**
   * Extract tools and functionalities from repomix output
   */
  async extractTools(repomixOutput, repositoryName) {
    const prompt = `Analyze the following repository and extract a list of tools/functions it provides.
For each tool, provide:
- name: The tool/function name
- description: Brief description of what it does
- type: The type (e.g., function, api, service, utility)

Repository: ${repositoryName}

Output:
${repomixOutput.substring(0, 4000)}

Respond with a JSON array of tools.`;

    if (!this.client) {
      return this.simulateToolExtraction(repomixOutput, repositoryName);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing code and extracting tools and functionalities. Always respond with valid JSON.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = response.choices[0].message.content.trim();
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error extracting tools:', error.message);
      return this.simulateToolExtraction(repomixOutput, repositoryName);
    }
  }

  /**
   * Compare repositories within a category
   */
  async compareRepositories(repositories, category) {
    const repoSummaries = repositories.map(repo => ({
      name: repo.name,
      description: repo.description,
      category: repo.category,
      summary: repo.repomix_output?.substring(0, 1000) || 'No output available'
    }));

    const prompt = `Compare the following repositories in the "${category}" category and provide:
1. Key similarities
2. Key differences
3. Strengths of each
4. Recommended use cases for each

Repositories:
${JSON.stringify(repoSummaries, null, 2)}

Provide a structured comparison and recommendations.`;

    if (!this.client) {
      return this.simulateComparison(repositories, category);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at comparing software tools and providing recommendations.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1500
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error comparing repositories:', error.message);
      return this.simulateComparison(repositories, category);
    }
  }

  /**
   * Generate recommendations based on analysis
   */
  async generateRecommendations(analysisResults, userNeeds = '') {
    const prompt = `Based on the following analysis results, generate recommendations for which MCP servers/tools to use:

Analysis Results:
${JSON.stringify(analysisResults, null, 2)}

User Needs: ${userNeeds || 'General purpose recommendations'}

Provide clear, actionable recommendations with reasoning.`;

    if (!this.client) {
      return this.simulateRecommendations(analysisResults);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at recommending tools based on analysis and user needs.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 1000
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating recommendations:', error.message);
      return this.simulateRecommendations(analysisResults);
    }
  }

  // Simulation methods for when API is not available
  simulateCategorization(repomixOutput, repositoryName) {
    const keywords = {
      'web-scraping': ['scrape', 'crawler', 'puppeteer', 'cheerio', 'playwright'],
      'data-processing': ['data', 'process', 'transform', 'etl', 'pipeline'],
      'api-integration': ['api', 'rest', 'graphql', 'endpoint', 'fetch'],
      'database': ['database', 'sql', 'mongodb', 'postgres', 'sqlite'],
      'file-management': ['file', 'fs', 'storage', 'upload', 'download'],
      'cloud-services': ['aws', 'azure', 'gcp', 'cloud', 's3'],
      'ai-ml': ['ai', 'ml', 'machine learning', 'tensorflow', 'openai'],
      'developer-tools': ['dev', 'tool', 'utility', 'helper', 'mcp'],
      'communication': ['chat', 'message', 'email', 'notification', 'slack']
    };

    const lowerOutput = repomixOutput.toLowerCase();
    let bestMatch = 'other';
    let maxMatches = 0;

    for (const [category, terms] of Object.entries(keywords)) {
      const matches = terms.filter(term => lowerOutput.includes(term)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = category;
      }
    }

    return `${bestMatch}\n\nThis repository appears to be related to ${bestMatch} based on keyword analysis. It contains functionality typical of this category.`;
  }

  simulateToolExtraction(repomixOutput, repositoryName) {
    // Extract function-like patterns from the output
    const tools = [];
    const functionPattern = /(?:function|const|export)\s+(\w+)/g;
    const matches = [...repomixOutput.matchAll(functionPattern)].slice(0, 10);

    matches.forEach(match => {
      tools.push({
        name: match[1],
        description: `Function or tool extracted from ${repositoryName}`,
        type: 'function'
      });
    });

    if (tools.length === 0) {
      tools.push({
        name: repositoryName,
        description: 'Main repository functionality',
        type: 'service'
      });
    }

    return tools;
  }

  simulateComparison(repositories, category) {
    return `Comparison of ${repositories.length} repositories in the "${category}" category:

Similarities:
- All repositories provide functionality related to ${category}
- Common tools and patterns are used across implementations

Differences:
${repositories.map((repo, idx) => `- ${repo.name}: ${repo.description || 'Unique implementation approach'}`).join('\n')}

Recommendations:
Consider your specific use case when choosing between these options. Each has its strengths for different scenarios.`;
  }

  simulateRecommendations(analysisResults) {
    return `Based on the analysis, here are the recommendations:

1. Consider the category that best matches your needs
2. Review the tools available in each repository
3. Compare features and choose the best fit
4. Start with the most actively maintained repository

The analysis shows diverse options across different categories, providing good coverage for various use cases.`;
  }
}

export default LLMAnalyzer;
