# Cloudflare Pages Deployment Guide

This guide explains how to deploy the Code Golf Visualizer to Cloudflare Pages using GitHub Actions.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Cloudflare Pages Project**: Create a new Pages project in your Cloudflare dashboard
3. **GitHub Repository**: Your code should be in a GitHub repository
4. **Node.js 18+**: For local development and testing

## Setup Instructions

### 1. Cloudflare Pages Setup

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
2. Click "Create a project"
3. Choose "Connect to Git" or "Direct Upload"
4. Note your project name (e.g., `code-golf-visualizer`)

### 2. GitHub Repository Secrets & Variables

In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions**:

#### Repository Secrets:
| Secret | Value | Description |
|--------|-------|-------------|
| `CLOUDFLARE_API_TOKEN` | `your-api-token` | Cloudflare API token with Pages permissions |
| `CLOUDFLARE_ACCOUNT_ID` | `your-account-id` | Your Cloudflare Account ID |

#### Repository Variables:
| Variable | Value | Description |
|----------|-------|-------------|
| `CLOUDFLARE_PROJECT_NAME` | `your-project-name` | Your Cloudflare Pages project name |

#### Getting Cloudflare Credentials:

**API Token:**
1. Go to [Cloudflare Profile](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Custom token" template
4. Permissions needed:
   - `Zone:Zone:Read`
   - `Zone:Page Rules:Edit`
   - `Account:Cloudflare Pages:Edit`

**Account ID:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain
3. Scroll down to find "Account ID" in the right sidebar

### 3. GitHub Actions Workflow

The `.github/workflows/deploy.yml` file is already configured with:

- **Build Job**: Compiles and optimizes the application
- **Deploy Job**: Deploys to Cloudflare Pages (main branch only)
- **Deploy Preview Job**: Creates preview environments for pull requests
- **Source Map Removal**: Removes .map files from deployment (but keeps them in build)
- **PR Comments**: Automatically comments on PRs with preview links

## Deployment Workflows

### Automatic Deployment (Main Branch)
- Pushes to `main` branch automatically trigger deployment
- The workflow builds the app and deploys to production
- You can also trigger manually from GitHub Actions tab

### Pull Request Previews
- Pull requests automatically trigger preview builds
- Preview deployments create temporary environments
- PR comments include preview URLs automatically

### Manual Deployment
You can manually trigger deployment:
1. Go to GitHub repository → Actions tab
2. Select "🚀 Deploy to Cloudflare Pages" workflow
3. Click "Run workflow" button

## Local Deployment

### Using Scripts

#### Windows (PowerShell):
```powershell
# Set environment variable
$env:CLOUDFLARE_PROJECT_NAME = "your-project-name"

# Run deployment script
.\deploy.ps1
```

#### Linux/macOS (Bash):
```bash
# Set environment variable
export CLOUDFLARE_PROJECT_NAME="your-project-name"

# Make script executable and run
chmod +x deploy.sh
./deploy.sh
```

### Manual Local Deployment

```bash
# Install Wrangler CLI
npm install -g wrangler@latest

# Login to Cloudflare
wrangler login

# Build the project
npm run build:deploy

# Deploy
wrangler pages deploy dist/ --project-name="your-project-name"
```

## Build Configuration

### Source Maps
- **Development**: Source maps are generated for debugging
- **Production Build**: Source maps are generated but removed from deployment
- **Future Sentry Integration**: Source maps can be uploaded to Sentry before removal

### Build Artifacts
The pipeline creates optimized builds with:
- ✅ Minified CSS (32% smaller)
- ✅ Minified JavaScript (31% smaller)  
- ✅ Minified HTML (44% smaller)
- ✅ Content hashing for cache busting
- ✅ Vendor code splitting
- ❌ Source maps removed from deployment

### Cache Strategy
- **HTML**: No cache (`max-age=0, must-revalidate`)
- **JS/CSS with hashes**: Long-term cache (`max-age=31536000, immutable`)
- **GitHub Actions**: Caches `node_modules` between builds

## Monitoring & Debugging

### Build Logs
- Check GitHub Actions → Workflows for build logs
- Cloudflare Pages dashboard shows deployment status

### Performance Monitoring
```bash
# Check bundle sizes
npm run build
ls -lh dist/

# Analyze build
npx webpack-bundle-analyzer dist/
```

### Troubleshooting

#### Common Issues:

1. **API Token Issues**:
   ```
   Error: Authentication error
   ```
   - Check your `CLOUDFLARE_API_TOKEN` is correct
   - Ensure token has required permissions
   - Verify `CLOUDFLARE_ACCOUNT_ID` is set correctly

2. **Project Name Issues**:
   ```
   Error: Project not found
   ```
   - Verify `CLOUDFLARE_PROJECT_NAME` matches exactly
   - Check project exists in Cloudflare dashboard

3. **Build Failures**:
   ```
   npm ERR! missing script: build:deploy
   ```
   - Ensure you've updated `package.json` with new scripts

## Security Headers

The deployment includes security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Custom Domain (Optional)

1. In Cloudflare Pages dashboard
2. Go to your project → Custom domains
3. Add your domain
4. Configure DNS records as instructed

## Environment-Specific Builds

To add environment-specific configurations:

```javascript
// In webpack.config.js
const environment = process.env.NODE_ENV || 'development';
const isCloudflare = process.env.GITHUB_ACTIONS === 'true';

// Add environment-specific settings
```

Your Code Golf Visualizer is now ready for professional deployment with Cloudflare Pages! 🚀
