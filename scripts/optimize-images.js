#!/usr/bin/env node
/**
 * Image Optimization Script
 * 
 * Converts all JPG/PNG images in the public folder to WebP format
 * with compression to reduce file size while maintaining acceptable quality.
 * 
 * Requirements: sharp package (npm install sharp)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ Error: sharp package not found.');
  console.log('📦 Installing sharp...');
  try {
    execSync('npm install sharp --save-dev', { stdio: 'inherit' });
    sharp = require('sharp');
    console.log('✅ sharp installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install sharp. Please run: npm install sharp --save-dev');
    process.exit(1);
  }
}

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const QUALITY = 80; // WebP quality (0-100, 80 is good balance)
const MAX_WIDTH = 2048; // Max width for images (skybox images can be large)

/**
 * Recursively find all image files
 */
function findImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findImages(filePath, fileList);
    } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Convert image to WebP
 */
async function convertToWebP(inputPath, outputPath) {
  try {
    const metadata = await sharp(inputPath).metadata();
    const width = Math.min(metadata.width, MAX_WIDTH);
    
    await sharp(inputPath)
      .resize(width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: QUALITY })
      .toFile(outputPath);
    
    const inputStats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);
    const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(inputPath)} → ${path.basename(outputPath)} (${savings}% smaller)`);
    return { success: true, savings };
  } catch (error) {
    console.error(`❌ Failed to convert ${inputPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main optimization function
 */
async function optimizeImages() {
  console.log('🖼️  Starting image optimization...\n');
  console.log(`📁 Scanning: ${PUBLIC_DIR}\n`);
  
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error(`❌ Public directory not found: ${PUBLIC_DIR}`);
    process.exit(1);
  }
  
  const images = findImages(PUBLIC_DIR);
  console.log(`📸 Found ${images.length} images to optimize\n`);
  
  if (images.length === 0) {
    console.log('✅ No images found to optimize');
    return;
  }
  
  let successCount = 0;
  let failCount = 0;
  let totalSavings = 0;
  
  for (const imagePath of images) {
    const ext = path.extname(imagePath).toLowerCase();
    const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    // Skip if WebP already exists and is newer
    if (fs.existsSync(webpPath)) {
      const imageStats = fs.statSync(imagePath);
      const webpStats = fs.statSync(webpPath);
      if (webpStats.mtime > imageStats.mtime) {
        console.log(`⏭️  Skipping ${path.basename(imagePath)} (WebP already exists and is newer)`);
        continue;
      }
    }
    
    const result = await convertToWebP(imagePath, webpPath);
    if (result.success) {
      successCount++;
      totalSavings += parseFloat(result.savings);
    } else {
      failCount++;
    }
  }
  
  console.log('\n📊 Optimization Summary:');
  console.log(`✅ Successfully converted: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  if (successCount > 0) {
    console.log(`💾 Average size reduction: ${(totalSavings / successCount).toFixed(1)}%`);
  }
  console.log('\n✨ Image optimization complete!');
}

// Run optimization
optimizeImages().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

