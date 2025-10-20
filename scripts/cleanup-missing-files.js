const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Pakistan@2024@localhost:5432/wmp_db'
});

async function checkFileExists(filePath) {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    await fs.promises.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

async function cleanupMissingImages() {
  console.log('\n📸 Checking images...');
  
  try {
    const result = await pool.query('SELECT id, link, file_name FROM images ORDER BY created_at DESC');
    const images = result.rows;
    
    let missing = 0;
    let existing = 0;
    const missingIds = [];
    
    for (const image of images) {
      const exists = await checkFileExists(image.link);
      if (!exists) {
        missing++;
        missingIds.push(image.id);
        console.log(`❌ Missing: ${image.link}`);
      } else {
        existing++;
      }
    }
    
    console.log(`\n✅ Existing images: ${existing}`);
    console.log(`❌ Missing images: ${missing}`);
    
    if (missingIds.length > 0 && process.argv.includes('--delete')) {
      console.log('\n🗑️  Deleting database references to missing images...');
      await pool.query('DELETE FROM images WHERE id = ANY($1)', [missingIds]);
      console.log(`✅ Deleted ${missingIds.length} references`);
    } else if (missingIds.length > 0) {
      console.log('\n💡 Run with --delete flag to remove these references from the database');
    }
    
    return { missing, existing, missingIds };
  } catch (error) {
    console.error('Error checking images:', error);
    return { missing: 0, existing: 0, missingIds: [] };
  }
}

async function cleanupMissingVideos() {
  console.log('\n🎥 Checking videos...');
  
  try {
    const result = await pool.query('SELECT id, link, file_name FROM videos ORDER BY created_at DESC');
    const videos = result.rows;
    
    let missing = 0;
    let existing = 0;
    const missingIds = [];
    
    for (const video of videos) {
      const exists = await checkFileExists(video.link);
      if (!exists) {
        missing++;
        missingIds.push(video.id);
        console.log(`❌ Missing: ${video.link}`);
      } else {
        existing++;
      }
    }
    
    console.log(`\n✅ Existing videos: ${existing}`);
    console.log(`❌ Missing videos: ${missing}`);
    
    if (missingIds.length > 0 && process.argv.includes('--delete')) {
      console.log('\n🗑️  Deleting database references to missing videos...');
      await pool.query('DELETE FROM videos WHERE id = ANY($1)', [missingIds]);
      console.log(`✅ Deleted ${missingIds.length} references`);
    } else if (missingIds.length > 0) {
      console.log('\n💡 Run with --delete flag to remove these references from the database');
    }
    
    return { missing, existing, missingIds };
  } catch (error) {
    console.error('Error checking videos:', error);
    return { missing: 0, existing: 0, missingIds: [] };
  }
}

async function cleanupMissingFinalVideos() {
  console.log('\n🎬 Checking final videos...');
  
  try {
    const result = await pool.query('SELECT id, link, file_name FROM final_videos ORDER BY created_at DESC');
    const videos = result.rows;
    
    let missing = 0;
    let existing = 0;
    const missingIds = [];
    
    for (const video of videos) {
      const exists = await checkFileExists(video.link);
      if (!exists) {
        missing++;
        missingIds.push(video.id);
        console.log(`❌ Missing: ${video.link}`);
      } else {
        existing++;
      }
    }
    
    console.log(`\n✅ Existing final videos: ${existing}`);
    console.log(`❌ Missing final videos: ${missing}`);
    
    if (missingIds.length > 0 && process.argv.includes('--delete')) {
      console.log('\n🗑️  Deleting database references to missing final videos...');
      await pool.query('DELETE FROM final_videos WHERE id = ANY($1)', [missingIds]);
      console.log(`✅ Deleted ${missingIds.length} references`);
    } else if (missingIds.length > 0) {
      console.log('\n💡 Run with --delete flag to remove these references from the database');
    }
    
    return { missing, existing, missingIds };
  } catch (error) {
    console.error('Error checking final videos:', error);
    return { missing: 0, existing: 0, missingIds: [] };
  }
}

async function main() {
  console.log('🔍 Starting file cleanup check...');
  console.log('==================================\n');
  
  try {
    const imageStats = await cleanupMissingImages();
    const videoStats = await cleanupMissingVideos();
    const finalVideoStats = await cleanupMissingFinalVideos();
    
    const totalMissing = imageStats.missing + videoStats.missing + finalVideoStats.missing;
    const totalExisting = imageStats.existing + videoStats.existing + finalVideoStats.existing;
    
    console.log('\n==================================');
    console.log('📊 Summary:');
    console.log(`✅ Total existing files: ${totalExisting}`);
    console.log(`❌ Total missing files: ${totalMissing}`);
    
    if (totalMissing > 0 && !process.argv.includes('--delete')) {
      console.log('\n⚠️  To remove missing file references from database, run:');
      console.log('   node scripts/cleanup-missing-files.js --delete');
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await pool.end();
  }
}

main();

