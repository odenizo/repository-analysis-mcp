# Contributing to Repository Analysis MCP

Thank you for your interest in contributing to Repository Analysis MCP! This guide will help you get started.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/repository-analysis-mcp.git
   cd repository-analysis-mcp
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY if needed
   ```

## Project Structure

```
repository-analysis-mcp/
├── .github/workflows/      # GitHub Actions workflows
├── src/
│   ├── analysis/          # LLM analysis components
│   │   └── llm-analyzer.js
│   ├── database/          # Database layer
│   │   └── db.js
│   ├── utils/             # Utility functions
│   │   └── repomix.js
│   ├── index.js           # Main CLI application
│   ├── process-repository.js  # Single repository processor
│   └── analyze-repositories.js # Multi-repository analyzer
├── package.json
└── README.md
```

## Making Changes

### Adding New Features

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the existing code style

3. Test your changes:
   ```bash
   # Run manual tests
   node src/index.js help
   bash demo.sh
   ```

4. Commit your changes:
   ```bash
   git add .
   git commit -m "Add feature: description of your feature"
   ```

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a Pull Request

### Code Style

- Use ES6+ features (modules, async/await, etc.)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and single-purpose
- Use consistent indentation (2 spaces)

### Testing

Currently, the project uses manual testing. When adding features:

1. Test with the CLI commands
2. Test with the demo script
3. Verify database operations
4. Test error handling

## Areas for Contribution

### High Priority

- [ ] Add automated tests (unit tests, integration tests)
- [ ] Add support for more LLM providers (Anthropic, local models)
- [ ] Improve error handling and recovery
- [ ] Add progress indicators for long-running operations
- [ ] Add caching to avoid re-processing unchanged repositories

### Medium Priority

- [ ] Add web UI for browsing analysis results
- [ ] Support for private repositories
- [ ] Export reports to different formats (HTML, PDF)
- [ ] Add more categorization categories
- [ ] Improve tool extraction accuracy

### Documentation

- [ ] Add more examples
- [ ] Create video tutorials
- [ ] Add architecture diagrams
- [ ] Document API endpoints (if web UI is added)

## Reporting Issues

When reporting issues, please include:

1. Description of the problem
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Environment details (Node version, OS)
6. Relevant logs or error messages

## Questions?

Feel free to open an issue for any questions or suggestions!

## License

By contributing, you agree that your contributions will be licensed under the ISC License.
