#!/usr/bin/env node

/**
 * Test script for R2 upload functionality
 * Run with: node scripts/test-r2-upload.js
 */

const fs = require('fs');
const path = require('path');

// Create a test image file
function createTestImage() {
  // Create a simple 1x1 pixel PNG
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // 8-bit RGB
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, // compressed data
    0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // end
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
    0xAE, 0x42, 0x60, 0x82
  ]);
  
  const testImagePath = path.join(__dirname, 'test-image.png');
  fs.writeFileSync(testImagePath, pngData);
  return testImagePath;
}

async function testUpload() {
  console.log('🧪 Testing R2 upload...');
  
  // Create test image
  const testImagePath = createTestImage();
  console.log(`📁 Created test image: ${testImagePath}`);
  
  try {
    // Test upload
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream(testImagePath));
    
    const response = await fetch('http://localhost:3000/api/upload/image', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Upload successful!');
      console.log(`🔗 URL: ${result.url}`);
      console.log(`📄 File: ${result.fileName}`);
      console.log(`📏 Size: ${result.size} bytes`);
      
      // Test URL accessibility
      console.log('\n🌐 Testing URL accessibility...');
      try {
        const urlResponse = await fetch(result.url);
        if (urlResponse.ok) {
          console.log('✅ URL is accessible!');
          console.log(`📊 Status: ${urlResponse.status}`);
          console.log(`📋 Content-Type: ${urlResponse.headers.get('content-type')}`);
        } else {
          console.log('❌ URL is not accessible');
          console.log(`📊 Status: ${urlResponse.status}`);
          console.log(`📋 Response: ${await urlResponse.text()}`);
        }
      } catch (urlError) {
        console.log('❌ URL test failed:', urlError.message);
      }
      
    } else {
      console.log('❌ Upload failed:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  } finally {
    // Cleanup
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('🧹 Cleaned up test image');
    }
  }
}

// Check environment variables
function checkEnv() {
  console.log('🔍 Checking environment variables...');
  
  const required = [
    'CLOUDFLARE_ACCOUNT_ID',
    'CLOUDFLARE_R2_ACCESS_KEY_ID', 
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    'CLOUDFLARE_R2_BUCKET_NAME'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:');
    missing.forEach(key => console.log(`   - ${key}`));
    console.log('\n📝 Please set these in your .env.local file');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
  console.log(`🏢 Account ID: ${process.env.CLOUDFLARE_ACCOUNT_ID}`);
  console.log(`🪣 Bucket: ${process.env.CLOUDFLARE_R2_BUCKET_NAME}`);
  console.log(`🌐 Public URL: ${process.env.CLOUDFLARE_R2_PUBLIC_URL || 'Using R2.dev subdomain'}`);
}

// Main execution
async function main() {
  console.log('🚀 R2 Upload Test Script');
  console.log('========================\n');
  
  checkEnv();
  console.log('');
  
  await testUpload();
  
  console.log('\n📋 Next steps if upload failed:');
  console.log('1. Check R2 bucket public access settings');
  console.log('2. Verify bucket policy allows public read');
  console.log('3. Check if custom domain is configured correctly');
  console.log('4. See docs/r2-setup-guide.md for detailed instructions');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testUpload, checkEnv };
