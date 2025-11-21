import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildDir = path.join(__dirname, '../dist');
const themeDir = path.join(__dirname, '../../dist');

// Clean function - remove directory recursively
function cleanDirectory(dir) {
  if (fs.existsSync(dir)) {
    try {
      // Use fs.rmSync with recursive option (Node.js 14.14.0+)
      fs.rmSync(dir, { recursive: true, force: true });
    } catch (error) {
      // Fallback for older Node.js versions
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
          const curPath = path.join(dir, file);
          if (fs.lstatSync(curPath).isDirectory()) {
            fs.rmSync(curPath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(dir);
      }
    }
  }
}

// Ensure theme dist directory exists (clean it first on initial setup)
let isInitialCopy = true;

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
      // Clean destination on initial copy
      if (isInitialCopy) {
        cleanDirectory(themeDir);
        fs.mkdirSync(themeDir, { recursive: true });
        isInitialCopy = false;
      } else {
        // On subsequent copies, clean only the assets folder to remove old build artifacts
        const assetsDir = path.join(themeDir, 'assets');
        if (fs.existsSync(assetsDir)) {
          cleanDirectory(assetsDir);
        }
      }
      
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
