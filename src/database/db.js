import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class RepositoryDatabase {
  constructor(dbPath = 'repositories.db') {
    this.db = new Database(dbPath);
    this.initSchema();
  }

  initSchema() {
    // Repositories table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS repositories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        description TEXT,
        processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        repomix_output TEXT,
        category TEXT,
        metadata TEXT
      )
    `);

    // Tools table - extracted from repositories
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repository_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT,
        metadata TEXT,
        FOREIGN KEY (repository_id) REFERENCES repositories(id)
      )
    `);

    // Categories table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Analysis results table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analysis_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repository_id INTEGER,
        analysis_type TEXT NOT NULL,
        result TEXT,
        score REAL,
        analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (repository_id) REFERENCES repositories(id)
      )
    `);

    // Comparisons table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS comparisons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        repository_ids TEXT,
        comparison_result TEXT,
        recommendations TEXT,
        compared_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // Repository methods
  addRepository(name, url, description = '') {
    const stmt = this.db.prepare(`
      INSERT INTO repositories (name, url, description)
      VALUES (?, ?, ?)
    `);
    return stmt.run(name, url, description);
  }

  updateRepomixOutput(repositoryId, repomixOutput) {
    const stmt = this.db.prepare(`
      UPDATE repositories 
      SET repomix_output = ?, processed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(repomixOutput, repositoryId);
  }

  updateCategory(repositoryId, category) {
    const stmt = this.db.prepare(`
      UPDATE repositories 
      SET category = ?
      WHERE id = ?
    `);
    return stmt.run(category, repositoryId);
  }

  getRepository(id) {
    const stmt = this.db.prepare('SELECT * FROM repositories WHERE id = ?');
    return stmt.get(id);
  }

  getAllRepositories() {
    const stmt = this.db.prepare('SELECT * FROM repositories');
    return stmt.all();
  }

  getRepositoriesByCategory(category) {
    const stmt = this.db.prepare('SELECT * FROM repositories WHERE category = ?');
    return stmt.all(category);
  }

  // Tool methods
  addTool(repositoryId, name, description, type, metadata = {}) {
    const stmt = this.db.prepare(`
      INSERT INTO tools (repository_id, name, description, type, metadata)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(repositoryId, name, description, type, JSON.stringify(metadata));
  }

  getToolsByRepository(repositoryId) {
    const stmt = this.db.prepare('SELECT * FROM tools WHERE repository_id = ?');
    return stmt.all(repositoryId);
  }

  getAllTools() {
    const stmt = this.db.prepare(`
      SELECT t.*, r.name as repository_name, r.url as repository_url
      FROM tools t
      JOIN repositories r ON t.repository_id = r.id
    `);
    return stmt.all();
  }

  // Category methods
  addCategory(name, description = '') {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO categories (name, description)
      VALUES (?, ?)
    `);
    return stmt.run(name, description);
  }

  getAllCategories() {
    const stmt = this.db.prepare('SELECT * FROM categories');
    return stmt.all();
  }

  // Analysis methods
  addAnalysisResult(repositoryId, analysisType, result, score = null) {
    const stmt = this.db.prepare(`
      INSERT INTO analysis_results (repository_id, analysis_type, result, score)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(repositoryId, analysisType, result, score);
  }

  getAnalysisResults(repositoryId) {
    const stmt = this.db.prepare('SELECT * FROM analysis_results WHERE repository_id = ?');
    return stmt.all(repositoryId);
  }

  // Comparison methods
  addComparison(category, repositoryIds, comparisonResult, recommendations) {
    const stmt = this.db.prepare(`
      INSERT INTO comparisons (category, repository_ids, comparison_result, recommendations)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(
      category,
      JSON.stringify(repositoryIds),
      comparisonResult,
      recommendations
    );
  }

  getComparisonsByCategory(category) {
    const stmt = this.db.prepare('SELECT * FROM comparisons WHERE category = ?');
    return stmt.all(category);
  }

  close() {
    this.db.close();
  }
}

export default RepositoryDatabase;
