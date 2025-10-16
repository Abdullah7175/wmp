const fs = require('fs-extra');
const path = require('path');

async function setupStandalone() {
  console.log('🔧 Setting up standalone deployment...');

  const rootDir = path.join(__dirname, '..');
  const standaloneDir = path.join(rootDir, '.next', 'standalone');
  const staticDir = path.join(rootDir, '.next', 'static');
  const publicDir = path.join(rootDir, 'public');

  try {
    // Check if standalone directory exists
    if (!fs.existsSync(standaloneDir)) {
      console.error('❌ Standalone directory not found. Please run "npm run build" first.');
      process.exit(1);
    }

    console.log('📁 Copying static files...');
    
    // Create .next directory in standalone if it doesn't exist
    const standaloneNextDir = path.join(standaloneDir, '.next');
    await fs.ensureDir(standaloneNextDir);

    // Copy static files
    if (fs.existsSync(staticDir)) {
      const targetStaticDir = path.join(standaloneNextDir, 'static');
      await fs.copy(staticDir, targetStaticDir, { overwrite: true });
      console.log('✅ Static files copied');
    } else {
      console.warn('⚠️  Static directory not found');
    }

    // Copy public files
    if (fs.existsSync(publicDir)) {
      const targetPublicDir = path.join(standaloneDir, 'public');
      await fs.copy(publicDir, targetPublicDir, { overwrite: true });
      console.log('✅ Public files copied');
    } else {
      console.warn('⚠️  Public directory not found');
    }

    console.log('✨ Standalone setup complete!');
    console.log('📝 You can now run: node .next/standalone/server.js');

  } catch (error) {
    console.error('❌ Error setting up standalone:', error);
    process.exit(1);
  }
}

setupStandalone();

