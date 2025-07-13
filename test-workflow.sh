#!/bin/bash

# Test GitHub Actions workflow locally with act
# Usage: ./test-workflow.sh [workflow-name] [event-type]

WORKFLOW=${1:-build}
EVENT=${2:-push}

echo "🧪 Testing GitHub Actions workflow locally with act"
echo "Workflow: $WORKFLOW"
echo "Event: $EVENT"
echo ""

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo "❌ Act is not installed. Please install it first:"
    echo "See: https://github.com/nektos/act#installation"
    exit 1
fi

# Check if secrets file exists
if [ ! -f ".secrets" ]; then
    echo "❌ .secrets file not found. Please create it with your Cloudflare credentials."
    echo "See .secrets.example for the format."
    exit 1
fi

# Set common act parameters
ACT_PARAMS=(
    --secret-file .secrets
    --var-file .vars
    --verbose
    --container-architecture linux/amd64
)

# Run specific workflow based on parameter
case $WORKFLOW in
    "build")
        echo "🔨 Testing build job only..."
        act "${ACT_PARAMS[@]}" --job build $EVENT
        ;;
    "deploy")
        echo "🚀 Testing deploy job (requires build artifacts)..."
        echo "Note: This will attempt actual deployment!"
        act "${ACT_PARAMS[@]}" --job deploy $EVENT
        ;;
    "preview")
        echo "🔍 Testing preview deployment..."
        echo "Note: This will attempt actual deployment!"
        act "${ACT_PARAMS[@]}" --job deploy-preview pull_request
        ;;
    "all")
        echo "🌟 Testing complete workflow..."
        echo "Note: This will attempt actual deployment!"
        act "${ACT_PARAMS[@]}" $EVENT
        ;;
    "dry-run")
        echo "🏃 Dry run - checking workflow syntax..."
        act "${ACT_PARAMS[@]}" --dry-run $EVENT
        ;;
    *)
        echo "❌ Unknown workflow: $WORKFLOW"
        echo "Available options: build, deploy, preview, all, dry-run"
        exit 1
        ;;
esac

echo ""
echo "✅ Test completed!"
