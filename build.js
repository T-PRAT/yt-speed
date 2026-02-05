#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BUILD_DIR = 'dist';
const CHROME_DIR = path.join(BUILD_DIR, 'chrome');
const FIREFOX_DIR = path.join(BUILD_DIR, 'firefox');

const FILES_TO_COPY = [
  'background',
  'content',
  'popup',
  'icons'
];

function cleanAndCreateDirs() {
  if (fs.existsSync(BUILD_DIR)) {
    fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(BUILD_DIR, { recursive: true });
  fs.mkdirSync(CHROME_DIR, { recursive: true });
  fs.mkdirSync(FIREFOX_DIR, { recursive: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function copyFiles(targetDir) {
  FILES_TO_COPY.forEach(item => {
    const src = path.join(process.cwd(), item);
    const dest = path.join(targetDir, item);
    if (fs.existsSync(src)) {
      copyRecursive(src, dest);
    }
  });
}

function buildManifest(browser) {
  let manifestPath;

  if (browser === 'chrome') {
    manifestPath = 'manifest.chrome.json';
  } else if (browser === 'firefox') {
    manifestPath = 'manifest.firefox.json';
  } else {
    throw new Error('Browser must be "chrome" or "firefox"');
  }

  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestContent);

  if (browser === 'firefox' && !manifest.browser_specific_settings) {
    manifest.browser_specific_settings = {
      gecko: {
        id: 'youtuberabbit@tprat',
        strict_min_version: '109.0'
      }
    };
  }

  return manifest;
}

function build(browser) {
  console.log(`\n🔨 Building for ${browser.toUpperCase()}...`);

  const targetDir = browser === 'chrome' ? CHROME_DIR : FIREFOX_DIR;

  if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
  }
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  copyFiles(targetDir);

  const manifest = buildManifest(browser);
  const manifestPath = path.join(targetDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`✓ Build complete: ${targetDir}`);
  console.log(`✓ Manifest created with ${browser === 'chrome' ? 'service_worker' : 'background.scripts'}`);

  if (browser === 'firefox' && manifest.browser_specific_settings) {
    console.log(`✓ Firefox ID: ${manifest.browser_specific_settings.gecko.id}`);
  }
}

const args = process.argv.slice(2);
const browser = args[0];

if (!browser || (browser !== 'chrome' && browser !== 'firefox')) {
  cleanAndCreateDirs();
  build('chrome');
  build('firefox');
  console.log('\n✅ All builds complete!');
  console.log('📦 Chrome: dist/chrome/');
  console.log('📦 Firefox: dist/firefox/');
} else {
  build(browser);
}
