# PowerShell deployment script for Code Golf Visualizer
# This script builds the project and deploys it to Cloudflare Pages

param(
    [string]$ProjectName = $env:CF_PAGES_PROJECT_NAME
)

# Enable strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# Check if required environment variables are set
if (-not $ProjectName) {
    Write-Host "❌ Error: CF_PAGES_PROJECT_NAME environment variable is not set" -ForegroundColor Red
    Write-Host "Please set it to your Cloudflare Pages project name" -ForegroundColor Yellow
    Write-Host "Example: `$env:CF_PAGES_PROJECT_NAME = 'code-golf-visualizer'" -ForegroundColor Yellow
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm ci
}

# Build the project
Write-Host "🔨 Building project for production..." -ForegroundColor Yellow
npm run build:deploy

# Check if build was successful
if (-not (Test-Path "dist")) {
    Write-Host "❌ Build failed - dist directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully" -ForegroundColor Green
Write-Host "📁 Build artifacts:" -ForegroundColor Cyan
Get-ChildItem -Path "dist" | Format-Table Name, Length, LastWriteTime

# Deploy to Cloudflare Pages
Write-Host "🌐 Deploying to Cloudflare Pages..." -ForegroundColor Yellow

# Check if wrangler is installed
try {
    wrangler --version | Out-Null
} catch {
    Write-Host "📥 Installing Wrangler CLI..." -ForegroundColor Yellow
    npm install -g wrangler@latest
}

# Deploy
Write-Host "Deploying to project: $ProjectName" -ForegroundColor Cyan
wrangler pages deploy dist/ --project-name="$ProjectName" --compatibility-date=2024-01-01

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "🔗 Your site should be available at: https://$ProjectName.pages.dev" -ForegroundColor Cyan
