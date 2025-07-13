# Testing GitHub Actions Locally with Act

This guide explains how to test the GitHub Actions workflow locally using `act`.

## Prerequisites

1. **Docker**: Act uses Docker containers to simulate GitHub runners
2. **Act**: Install via `winget install nektos.act` (Windows) or see [Act Installation](https://github.com/nektos/act#installation)

## Setup

### 1. Configure Secrets

Copy the example secrets file and fill in your credentials:
```powershell
Copy-Item .secrets.example .secrets
# Edit .secrets with your actual values
```

### 2. Update Variables (Optional)

Edit `.vars` if you need to change the Cloudflare project name:
```bash
CLOUDFLARE_PROJECT_NAME=your-project-name
```

### 3. Configure Act (Optional)

The `.actrc` file is already configured to use appropriate Docker images.

## Testing Commands

### Quick Tests (Safe)

```powershell
# Test workflow syntax (no execution)
.\test-workflow.ps1 dry-run

# Test build job only (safe - no deployment)
.\test-workflow.ps1 build

# Test build job with pull request event
.\test-workflow.ps1 build pull_request
```

### Deployment Tests (⚠️ Will Deploy)

```powershell
# Test production deployment (will actually deploy!)
.\test-workflow.ps1 deploy

# Test preview deployment (will create preview!)
.\test-workflow.ps1 preview

# Test complete workflow (will deploy!)
.\test-workflow.ps1 all
```

### Advanced Usage

```powershell
# Run specific job directly with act
act --secret-file .secrets --var-file .vars --job build

# Run with different event
act --secret-file .secrets --var-file .vars pull_request

# Debug mode with verbose output
act --secret-file .secrets --var-file .vars --verbose --job build

# List available workflows
act --list

# Dry run to check syntax
act --secret-file .secrets --var-file .vars --dry-run
```

## Docker Images

Act uses these Docker images (configured in `.actrc`):
- `catthehacker/ubuntu:act-latest` - Full Ubuntu environment
- Includes Node.js, npm, and common build tools
- ~2GB download on first run

## Troubleshooting

### Common Issues

1. **Docker not running**:
   ```
   Error: Cannot connect to the Docker daemon
   ```
   Solution: Start Docker Desktop

2. **Missing secrets**:
   ```
   Error: Required secret not found
   ```
   Solution: Ensure `.secrets` file exists with correct values

3. **Network issues in container**:
   ```
   Error: npm install failed
   ```
   Solution: Check Docker's network settings

4. **Permission issues**:
   ```
   Error: Permission denied
   ```
   Solution: Ensure Docker has proper permissions

### Testing Strategy

1. **Start with syntax check**: `dry-run`
2. **Test build only**: Safe to run, no deployments
3. **Test with mock secrets**: Use fake values for initial testing
4. **Full test with real secrets**: Only when ready to deploy

### Performance Tips

- First run downloads Docker images (~2GB)
- Subsequent runs are much faster
- Use `--job` flag to test specific jobs
- Cache is shared between runs

## Security Notes

- `.secrets` file is in `.gitignore` - never commit it
- Use minimal permissions for API tokens
- Consider using test/staging environments for initial testing
- GitHub token only needs `repo` scope for PR comments

## Integration with Development

```powershell
# Add to package.json scripts:
"scripts": {
  "test:workflow": "pwsh -File test-workflow.ps1 build",
  "test:deploy": "pwsh -File test-workflow.ps1 all"
}

# Run via npm
npm run test:workflow
```

Your GitHub Actions workflow is now ready for local testing! 🧪
