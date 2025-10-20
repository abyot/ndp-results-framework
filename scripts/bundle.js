// scripts/bundle.js
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const pkg = require('../package.json');

const name = (pkg.name || 'app').replace(/[@/]/g, '');
const ver  = pkg.version || '0.0.0';
const ts   = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

const srcDir = path.resolve(__dirname, '../build'); // <-- contents to zip
const outDir = path.resolve(__dirname, '../dist');
const outZip = path.join(outDir, `${name}-${ver}-${ts}.zip`);

if (!fs.existsSync(srcDir)) {
  console.error('❌ build/ not found. Run your build first.');
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const output = fs.createWriteStream(outZip);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ Created ${path.basename(outZip)} (${archive.pointer()} bytes)`);
});
archive.on('error', err => { throw err; });

archive.pipe(output);
archive.directory(srcDir + '/', false); // <-- include contents only
archive.finalize();
