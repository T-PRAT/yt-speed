#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const browser = process.argv[2];

if (!browser || (browser !== 'chrome' && browser !== 'firefox')) {
	console.error('Usage: node zip.js [chrome|firefox]');
	process.exit(1);
}

const sourceDir = path.join('dist', browser);
const zipFile = path.join('dist', `${browser}.zip`);

if (!fs.existsSync(sourceDir)) {
	console.error(`❌ Build directory not found: ${sourceDir}`);
	console.error('Run "npm run build:' + browser + '" first');
	process.exit(1);
}

try {
	process.chdir(sourceDir);
	execSync(`zip -r ../${browser}.zip .`, { stdio: 'inherit' });
	process.chdir('../..');
	console.log(`✓ Package created: ${zipFile}`);
} catch (error) {
	try {
		const archiver = require('archiver');
		const output = fs.createWriteStream(path.resolve(zipFile));
		const archive = archiver('zip', { zlib: { level: 9 } });

		output.on('close', () => {
			console.log(`✓ Package created: ${zipFile} (${archive.pointer()} bytes)`);
		});

		archive.on('error', (err) => {
			throw err;
		});

		archive.pipe(output);
		archive.directory(sourceDir, false);
		archive.finalize();
	} catch (archiverError) {
		console.error('❌ Could not create ZIP file.');
		console.error('Options:');
		console.error('  1. Install zip: sudo apt-get install zip (Linux)');
		console.error('  2. Install archiver: npm install archiver');
		console.error('  3. Manually zip the dist/' + browser + '/ folder');
		process.exit(1);
	}
}
