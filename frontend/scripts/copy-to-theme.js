import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const buildDir = path.join(__dirname, '../dist');
const themeDir = path.join(__dirname, '../../dist');

// Clean function - remove directory recursively (using modern fs.rmSync if available)
function cleanDirectory(dir) {
  if (fs.existsSync(dir)) {
    console.log('Cleaning existing theme dist directory...');
    try {
      // Use fs.rmSync with recursive option (Node.js 14.14.0+)
      fs.rmSync(dir, { recursive: true, force: true });
    } catch (error) {
      // Fallback for older Node.js versions
      console.warn('fs.rmSync not available, using fallback method');
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

// Clean and recreate theme dist directory
cleanDirectory(themeDir);
fs.mkdirSync(themeDir, { recursive: true });

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

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('Error: Build directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Copy all files from dist to theme dist
console.log('Copying Vite build to theme directory...');
copyRecursiveSync(buildDir, themeDir);
console.log('✓ Build files copied to theme/dist directory');
