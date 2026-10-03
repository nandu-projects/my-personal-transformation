const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const wwwDir = path.join(rootDir, 'www');

if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => {
      copyRecursive(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const itemsToCopy = ['index.html', 'manifest.json', 'sw.js', 'css', 'js', 'icons'];
itemsToCopy.forEach(item => {
  const src = path.join(rootDir, item);
  const dest = path.join(wwwDir, item);
  if (fs.existsSync(src)) {
    copyRecursive(src, dest);
  }
});

console.log('✓ Successfully prepared www distribution directory for Capacitor Android packaging.');
