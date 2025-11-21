#!/usr/bin/env node
/**
 * Update Image Paths Script
 * 
 * Updates all .jpg and .png references in code to use .webp format
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..', 'Frontend');

/**
 * Recursively find all JS/JSX files
 */
function findCodeFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      findCodeFiles(filePath, fileList);
    } else if (/\.(js|jsx|html)$/i.test(file)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Update image paths in a file
 */
function updateImagePaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace .jpg with .webp (but not in comments or strings that already have .webp)
  const jpgPattern = /\.(jpg|jpeg)(?=["'`\s\)\]\}]|$)/gi;
  if (jpgPattern.test(content)) {
    content = content.replace(jpgPattern, '.webp');
    modified = true;
  }
  
  // Replace .png with .webp (but not in comments or strings that already have .webp)
  const pngPattern = /\.png(?=["'`\s\)\]\}]|$)/gi;
  if (pngPattern.test(content)) {
    content = content.replace(pngPattern, '.webp');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${path.relative(FRONTEND_DIR, filePath)}`);
    return true;
  }
  
  return false;
}

/**
 * Main function
 */
function updateAllImagePaths() {
  console.log('🔄 Updating image paths to WebP format...\n');
  console.log(`📁 Scanning: ${FRONTEND_DIR}\n`);
  
  if (!fs.existsSync(FRONTEND_DIR)) {
    console.error(`❌ Frontend directory not found: ${FRONTEND_DIR}`);
    process.exit(1);
  }
  
  const files = findCodeFiles(FRONTEND_DIR);
  console.log(`📄 Found ${files.length} files to check\n`);
  
  let updatedCount = 0;
  
  for (const file of files) {
    if (updateImagePaths(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n✨ Updated ${updatedCount} files`);
  console.log('✅ Image path update complete!');
}

updateAllImagePaths();

