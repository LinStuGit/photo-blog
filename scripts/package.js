#!/usr/bin/env node

/**
 * Package script for Cloudflare Photo Blog
 * Creates a production-ready ZIP file excluding development files
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const packageJson = require('../package.json');

const rootDir = path.join(__dirname, '..');
const outputDir = path.join(rootDir, 'dist');
const outputFile = path.join(outputDir, `photo-blog-v${packageJson.version}.zip`);

// Files to include in the package
const includeFiles = [
  // Configuration
  'package.json',
  'package-lock.json',
  'wrangler.toml',
  'README.md',
  'DEPLOYMENT.md',
  'CHANGELOG.md',
  'TESTING.md',
  'FIXES.md',

  // Main worker
  'worker.js',

  // Public files
  'public/index.html',
  'public/admin.html',
  'public/styles.css',
  'public/admin.css',
  'public/app.js',
  'public/admin.js',

  // Migrations
  'migrations/0001_init.sql',
  'migrations/0002_add_exif.sql',
  'migrations/0003_add_site_settings.sql',
  'migrations/0004_add_layout_fields.sql',
  'migrations/0005_add_default_admin.sql',
  'migrations/0006_add_welcome_message.sql',
  'migrations/0007_add_delete_performance_indexes.sql',

  // Scripts
  'scripts/package.js',
  'scripts/migrate-all.js',
  'scripts/test.js',
];

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create write stream
const output = fs.createWriteStream(outputFile);
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Listen for archive events
output.on('close', () => {
  const totalBytes = archive.pointer();
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  console.log('\n✓ Package created successfully!');
  console.log(`  Output: ${outputFile}`);
  console.log(`  Size: ${totalMB} MB (${totalBytes} bytes)`);
  console.log(`  Files: ${includeFiles.length}`);
  console.log('\nTo deploy:');
  console.log('  1. Unzip the archive');
  console.log('  2. npm install');
  console.log('  3. npx wrangler ...');
  console.log('  4. npm run deploy');
});

archive.on('error', (err) => {
  console.error('Archive error:', err);
  process.exit(1);
});

// Pipe archive data to file
archive.pipe(output);

// Add files to archive
console.log('Creating package...');
includeFiles.forEach(file => {
  const filePath = path.join(rootDir, file);

  if (fs.existsSync(filePath)) {
    archive.file(filePath, { name: file });
    console.log(`  + ${file}`);
  } else {
    console.warn(`  ! Missing: ${file}`);
  }
});

// Finalize archive
archive.finalize();

// Copy latest release summary to dist directory
const latestReleaseSummary = path.join(rootDir, 'releases', `RELEASE-SUMMARY-v${packageJson.version}.md`);
const distReleaseSummary = path.join(outputDir, `RELEASE-SUMMARY-v${packageJson.version}.md`);

if (fs.existsSync(latestReleaseSummary)) {
  fs.copyFileSync(latestReleaseSummary, distReleaseSummary);
  console.log(`\n✓ Release summary copied to dist/`);
  console.log(`  File: RELEASE-SUMMARY-v${packageJson.version}.md`);
}
