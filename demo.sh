#!/bin/bash
# Example script to demonstrate the repository analysis system

echo "=========================================="
echo "Repository Analysis MCP - Demo Script"
echo "=========================================="
echo ""

# Create a small test repository locally for demonstration
TEST_REPO_DIR="/tmp/test-mcp-server"
mkdir -p "$TEST_REPO_DIR"

cd "$TEST_REPO_DIR"
git init

# Create a simple MCP server example
cat > package.json << 'EOF'
{
  "name": "example-mcp-server",
  "version": "1.0.0",
  "description": "An example MCP server for testing",
  "main": "index.js",
  "type": "module"
}
EOF

cat > index.js << 'EOF'
// Example MCP Server
export async function listTools() {
  return [
    { name: 'getData', description: 'Fetch data from API' },
    { name: 'processData', description: 'Process and transform data' }
  ];
}

export async function callTool(name, args) {
  if (name === 'getData') {
    return { data: 'example data' };
  }
  if (name === 'processData') {
    return { processed: true };
  }
}
EOF

cat > README.md << 'EOF'
# Example MCP Server

This is a test MCP server that provides data fetching and processing tools.

## Features
- Data retrieval
- Data processing
EOF

git add .
git commit -m "Initial commit"

echo "Test repository created at: $TEST_REPO_DIR"
echo ""

# Return to the main project directory
cd /home/runner/work/repository-analysis-mcp/repository-analysis-mcp

echo "=========================================="
echo "Step 1: Process the test repository"
echo "=========================================="
node src/process-repository.js "file://$TEST_REPO_DIR" test-mcp-server "A test MCP server"

echo ""
echo "=========================================="
echo "Step 2: List all repositories"
echo "=========================================="
node src/index.js list

echo ""
echo "=========================================="
echo "Step 3: View all tools"
echo "=========================================="
node src/index.js tools

echo ""
echo "=========================================="
echo "Step 4: Run analysis"
echo "=========================================="
node src/analyze-repositories.js

echo ""
echo "=========================================="
echo "Demo Complete!"
echo "=========================================="
echo ""
echo "Database file: repositories.db"
echo "Repomix outputs: repomix-outputs/"
echo ""
echo "You can now use the CLI commands:"
echo "  node src/index.js list"
echo "  node src/index.js categories"
echo "  node src/index.js tools"
echo ""
