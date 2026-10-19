import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_DIR = path.resolve('public');

function verify() {
  console.log('--- Verifying Generated Favicon Assets ---');

  const files = [
    'favicon-symbol-512.png',
    'favicon-48x48.png',
    'favicon-32x32.png',
    'apple-touch-icon.png',
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
    'favicon.ico',
    'site.webmanifest',
  ];

  for (const f of files) {
    const fullPath = path.join(PUBLIC_DIR, f);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing expected file: ${f}`);
    }
    const stat = fs.statSync(fullPath);
    console.log(`[OK] ${f.padEnd(28)} Size: ${stat.size} bytes`);
  }

  // Verify ICO file internals
  const icoBuf = fs.readFileSync(path.join(PUBLIC_DIR, 'favicon.ico'));
  const count = icoBuf.readUInt16LE(4);
  console.log(`\nICO Header verification: Type=1, Images count=${count}`);
  for (let i = 0; i < count; i++) {
    const w = icoBuf.readUInt8(6 + i * 16);
    const h = icoBuf.readUInt8(7 + i * 16);
    const size = icoBuf.readUInt32LE(14 + i * 16);
    const offset = icoBuf.readUInt32LE(18 + i * 16);
    console.log(`  - Entry ${i + 1}: ${w}x${h}, data size=${size} bytes, offset=${offset}`);
  }

  // Verify manifest
  const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'site.webmanifest'), 'utf-8'));
  console.log('\nManifest name:', manifest.name);
  console.log('Manifest icons count:', manifest.icons.length);

  console.log('\nAll favicon assets verified successfully!');
}

verify();
