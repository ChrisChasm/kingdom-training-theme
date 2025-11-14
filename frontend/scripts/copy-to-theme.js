import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
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

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('Error: Build directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Copy all files from dist to theme dist
console.log('Copying Vite build to theme directory...');
copyRecursiveSync(buildDir, themeDir);
console.log('✓ Build files copied to theme/dist directory');
