#!/usr/bin/env node

/**
 * Remove source map files from dist directory
 * This script is cross-platform and works on Windows, macOS, and Linux
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

console.log('🗑️  Removing source map files from dist directory...');

try {
  if (!fs.existsSync(distDir)) {
    console.log('ℹ️  Dist directory does not exist, nothing to clean');
    process.exit(0);
  }

  const files = fs.readdirSync(distDir);
  const mapFiles = files.filter(file => file.endsWith('.map'));

  if (mapFiles.length === 0) {
    console.log('ℹ️  No source map files found in dist directory');
    process.exit(0);
  }

  console.log(`📄 Found ${mapFiles.length} source map file(s):`);
  mapFiles.forEach(file => {
    const filePath = path.join(distDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   - ${file} (${sizeKB} KB)`);
  });

  // Remove the files
  mapFiles.forEach(file => {
    const filePath = path.join(distDir, file);
    fs.unlinkSync(filePath);
  });

  console.log(`✅ Successfully removed ${mapFiles.length} source map file(s)`);
  console.log('ℹ️  Source maps were generated for debugging but excluded from deployment');
  
} catch (error) {
  console.error('❌ Error removing source map files:', error.message);
  process.exit(1);
}
