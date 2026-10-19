import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC_IMG_PATH = 'C:/Users/wogus/.gemini/antigravity/brain/3db13787-50c7-42d9-946c-a5b97d9a1d29/.user_uploaded/media_1792414280302_65c08e77.png';
const PUBLIC_DIR = path.resolve('public');

// Helper to construct a multi-resolution ICO file from PNG buffers
function createIco(pngBuffers) {
  // pngBuffers: array of { width, height, buffer }
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const totalDirSize = headerSize + numImages * dirEntrySize;

  let totalSize = totalDirSize;
  for (const img of pngBuffers) {
    totalSize += img.buffer.length;
  }

  const icoBuffer = Buffer.alloc(totalSize);

  // 1. Write ICONDIR Header
  icoBuffer.writeUInt16LE(0, 0); // Reserved. Must always be 0.
  icoBuffer.writeUInt16LE(1, 2); // Specifies image type: 1 for icon (.ICO) image.
  icoBuffer.writeUInt16LE(numImages, 4); // Number of images in file.

  // 2. Write ICONDIRENTRY and concatenate image data
  let currentOffset = totalDirSize;
  for (let i = 0; i < numImages; i++) {
    const img = pngBuffers[i];
    const entryOffset = headerSize + i * dirEntrySize;

    icoBuffer.writeUInt8(img.width >= 256 ? 0 : img.width, entryOffset + 0); // Width
    icoBuffer.writeUInt8(img.height >= 256 ? 0 : img.height, entryOffset + 1); // Height
    icoBuffer.writeUInt8(0, entryOffset + 2); // Color count (0 for 256+ colors)
    icoBuffer.writeUInt8(0, entryOffset + 3); // Reserved
    icoBuffer.writeUInt16LE(1, entryOffset + 4); // Color planes
    icoBuffer.writeUInt16LE(32, entryOffset + 6); // Bits per pixel (32 for RGBA)
    icoBuffer.writeUInt32LE(img.buffer.length, entryOffset + 8); // Size of image data
    icoBuffer.writeUInt32LE(currentOffset, entryOffset + 12); // Offset of image data

    img.buffer.copy(icoBuffer, currentOffset);
    currentOffset += img.buffer.length;
  }

  return icoBuffer;
}

async function generateFavicons() {
  console.log('--- Generating Allcare Favicon Assets ---');
  console.log(`Source Image: ${SRC_IMG_PATH}`);

  // 1. Read source raw data
  const { data, info } = await sharp(SRC_IMG_PATH).raw().toBuffer({ resolveWithObject: true });
  const { width } = info;

  // Bounding box of the symbol (excluding 'allcare' text)
  // [minX: 269, minY: 163, maxX: 754, maxY: 639]
  const cropLeft = Math.max(0, 269 - 10);
  const cropTop = Math.max(0, 163 - 10);
  const cropRight = Math.min(width, 754 + 10);
  const cropBottom = Math.min(650, 639 + 10);

  const cropW = cropRight - cropLeft;
  const cropH = cropBottom - cropTop;

  const croppedData = Buffer.alloc(cropW * cropH * 4);

  // Exact Allcare brand green color
  const BRAND_R = 125;
  const BRAND_G = 190;
  const BRAND_B = 50;

  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcX = cropLeft + x;
      const srcY = cropTop + y;
      const srcIdx = (srcY * width + srcX) * channels;
      const dstIdx = (y * cropW + x) * 4;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      const isNearWhite = r > 245 && g > 245 && b > 245;

      if (isNearWhite) {
        croppedData[dstIdx] = BRAND_R;
        croppedData[dstIdx + 1] = BRAND_G;
        croppedData[dstIdx + 2] = BRAND_B;
        croppedData[dstIdx + 3] = 0; // Pure transparent
      } else {
        const deltaB = 255 - b;
        const deltaR = 255 - r;
        const normalizedCoverage = Math.max(deltaB / 200, deltaR / 125);
        let alpha = Math.round(Math.min(255, Math.max(0, normalizedCoverage * 255)));

        if (alpha > 240) {
          alpha = 255;
        }

        croppedData[dstIdx] = BRAND_R;
        croppedData[dstIdx + 1] = BRAND_G;
        croppedData[dstIdx + 2] = BRAND_B;
        croppedData[dstIdx + 3] = alpha;
      }
    }
  }

  // Trim transparent edges tightly around the symbol
  const trimmed = await sharp(croppedData, {
    raw: { width: cropW, height: cropH, channels: 4 },
  })
    .trim()
    .png()
    .toBuffer({ resolveWithObject: true });

  console.log(`Trimmed symbol bounds: ${trimmed.info.width}x${trimmed.info.height}`);

  // Place into 512x512 canvas with optimal 7% safe margin (inner size 440px)
  // This ensures the icon looks bold and prominent without clipping
  const innerSize = 440;
  const resizedSymbol = await sharp(trimmed.data)
    .resize(innerSize, innerSize, {
      fit: 'contain',
      kernel: sharp.kernel.lanczos3,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  const master512Buffer = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: resizedSymbol,
        top: Math.round((512 - innerSize) / 2),
        left: Math.round((512 - innerSize) / 2),
      },
    ])
    .png()
    .toBuffer();

  // A. Save Master Assets
  const symbol512Path = path.join(PUBLIC_DIR, 'favicon-symbol-512.png');
  fs.writeFileSync(symbol512Path, master512Buffer);
  console.log(`✓ Generated: ${symbol512Path} (512x512)`);

  const android512Path = path.join(PUBLIC_DIR, 'android-chrome-512x512.png');
  fs.writeFileSync(android512Path, master512Buffer);
  console.log(`✓ Generated: ${android512Path} (512x512)`);

  // B. Generate Derived PNGs
  const derivedSizes = [
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
  ];

  for (const item of derivedSizes) {
    const outPath = path.join(PUBLIC_DIR, item.name);
    await sharp(master512Buffer)
      .resize(item.size, item.size, {
        fit: 'contain',
        kernel: sharp.kernel.lanczos3,
      })
      .png()
      .toFile(outPath);
    console.log(`✓ Generated: ${outPath} (${item.size}x${item.size})`);
  }

  // C. Generate Multi-Size favicon.ico (16x16, 32x32, 48x48)
  const icoPng16 = await sharp(master512Buffer).resize(16, 16, { kernel: sharp.kernel.lanczos3 }).png().toBuffer();
  const icoPng32 = await sharp(master512Buffer).resize(32, 32, { kernel: sharp.kernel.lanczos3 }).png().toBuffer();
  const icoPng48 = await sharp(master512Buffer).resize(48, 48, { kernel: sharp.kernel.lanczos3 }).png().toBuffer();

  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: icoPng16 },
    { width: 32, height: 32, buffer: icoPng32 },
    { width: 48, height: 48, buffer: icoPng48 },
  ]);

  const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`✓ Generated: ${icoPath} (Multi-res ICO: 16x16, 32x32, 48x48)`);

  // D. Generate site.webmanifest
  const manifest = {
    name: '올케어탄성',
    short_name: '올케어탄성',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    theme_color: '#4F5844',
    background_color: '#FAF8F5',
    display: 'standalone',
  };

  const manifestPath = path.join(PUBLIC_DIR, 'site.webmanifest');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`✓ Generated: ${manifestPath}`);

  console.log('\n--- All Favicon Assets Successfully Created ---');
}

generateFavicons().catch(console.error);
