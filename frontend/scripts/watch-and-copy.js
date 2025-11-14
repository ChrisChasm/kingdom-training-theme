import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildDir = path.join(__dirname, '../dist');
const themeDir = path.join(__dirname, '../../dist');

// Ensure theme dist directory exists
if (!fs.existsSync(themeDir)) {
  fs.mkdirSync(themeDir, { recursive: true });
}

// Copy function
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

let copyTimeout = null;
let isCopying = false;

// Copy files with debouncing
function copyFiles() {
  if (!fs.existsSync(buildDir)) {
    return;
  }
  
  // Clear any pending copy
  if (copyTimeout) {
    clearTimeout(copyTimeout);
  }
  
  // Debounce: wait 200ms after last change before copying
  copyTimeout = setTimeout(() => {
    if (isCopying) return;
    isCopying = true;
    
    try {
      copyRecursiveSync(buildDir, themeDir);
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] ✓ Files copied to theme directory`);
    } catch (error) {
      console.error('❌ Error copying files:', error);
    } finally {
      isCopying = false;
    }
  }, 200);
}

// Initial copy
console.log('🔄 Performing initial copy...');
copyFiles();

// Watch for changes
console.log('\n👀 Watching dist directory for changes...');
console.log(`📁 Build: ${buildDir}`);
console.log(`📁 Theme: ${themeDir}`);
console.log('💡 Changes will be automatically copied to your MAMP WordPress theme\n');

fs.watch(buildDir, { recursive: true }, (eventType, filename) => {
  if (filename && !filename.includes('node_modules') && (eventType === 'change' || eventType === 'rename')) {
    copyFiles();
  }
});

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n👋 Stopping watch mode...');
  process.exit(0);
});
