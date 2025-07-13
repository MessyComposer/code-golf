#!/usr/bin/env pwsh

# Test GitHub Actions workflow locally with act
# Usage: .\test-workflow.ps1 [workflow-name] [event-type]

param(
    [string]$Workflow = "build",
    [string]$Event = "push"
)

Write-Host "🧪 Testing GitHub Actions workflow locally with act" -ForegroundColor Cyan
Write-Host "Workflow: $Workflow" -ForegroundColor Yellow
Write-Host "Event: $Event" -ForegroundColor Yellow
Write-Host ""

# Check if act is installed
if (!(Get-Command "act" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Act is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "winget install nektos.act" -ForegroundColor Yellow
    exit 1
}

# Check if secrets file exists
if (!(Test-Path ".secrets")) {
    Write-Host "❌ .secrets file not found. Please create it with your Cloudflare credentials." -ForegroundColor Red
    Write-Host "See .secrets.example for the format." -ForegroundColor Yellow
    exit 1
}

# Set common act parameters
$actParams = @(
    "--secret-file", ".secrets"
    "--var-file", ".vars"
    "--verbose"
    "--container-architecture", "linux/amd64"
)

# Run specific workflow based on parameter
switch ($Workflow) {
    "build" {
        Write-Host "🔨 Testing build job only..." -ForegroundColor Green
        & act $actParams --job build $Event
    }
    "deploy" {
        Write-Host "🚀 Testing deploy job (requires build artifacts)..." -ForegroundColor Green
        Write-Host "Note: This will attempt actual deployment!" -ForegroundColor Red
        & act $actParams --job deploy $Event
    }
    "preview" {
        Write-Host "🔍 Testing preview deployment..." -ForegroundColor Green
        Write-Host "Note: This will attempt actual deployment!" -ForegroundColor Red
        & act $actParams --job deploy-preview pull_request
    }
    "all" {
        Write-Host "🌟 Testing complete workflow..." -ForegroundColor Green
        Write-Host "Note: This will attempt actual deployment!" -ForegroundColor Red
        & act $actParams $Event
    }
    "dry-run" {
        Write-Host "🏃 Dry run - checking workflow syntax..." -ForegroundColor Green
        & act $actParams --dryrun $Event
    }
    default {
        Write-Host "❌ Unknown workflow: $Workflow" -ForegroundColor Red
        Write-Host "Available options: build, deploy, preview, all, dry-run" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Test completed!" -ForegroundColor Green
