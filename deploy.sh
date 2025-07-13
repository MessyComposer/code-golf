#!/bin/bash

# Deployment script for Code Golf Visualizer
# This script builds the project and deploys it to Cloudflare Pages

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Check if required environment variables are set
if [ -z "$CF_PAGES_PROJECT_NAME" ]; then
    echo "❌ Error: CF_PAGES_PROJECT_NAME environment variable is not set"
    echo "Please set it to your Cloudflare Pages project name"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci
fi

# Build the project
echo "🔨 Building project for production..."
npm run build:deploy

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully"
echo "📁 Build artifacts:"
ls -la dist/

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📥 Installing Wrangler CLI..."
    npm install -g wrangler@latest
fi

# Deploy
wrangler pages deploy dist/ \
    --project-name="$CF_PAGES_PROJECT_NAME" \
    --compatibility-date=2024-01-01

echo "🎉 Deployment completed successfully!"
echo "🔗 Your site should be available at: https://$CF_PAGES_PROJECT_NAME.pages.dev"
