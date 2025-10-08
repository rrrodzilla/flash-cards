/**
 * Icon generation script for PWA
 *
 * This script generates PNG icons from the SVG source.
 *
 * Requirements:
 * - Install sharp: pnpm add -D sharp
 * - Run: tsx scripts/generate-icons.ts
 *
 * Generates:
 * - icon-192x192.png (Android, Chrome)
 * - icon-512x512.png (Android, Chrome, maskable)
 * - apple-touch-icon.png (iOS, 180x180)
 * - favicon.ico (browser tab, 32x32)
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

async function generateIcons(): Promise<void> {
  try {
    // Try to import sharp
    const sharp = await import('sharp');

    const publicDir = join(process.cwd(), 'public');
    const svgPath = join(publicDir, 'icon.svg');
    const svgBuffer = readFileSync(svgPath);

    console.log('Generating PWA icons from SVG...');

    // Generate 192x192 (Android, Chrome)
    await sharp.default(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(join(publicDir, 'icon-192x192.png'));
    console.log('✅ Generated icon-192x192.png');

    // Generate 512x512 (Android, Chrome, maskable)
    await sharp.default(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(join(publicDir, 'icon-512x512.png'));
    console.log('✅ Generated icon-512x512.png');

    // Generate 180x180 (iOS apple-touch-icon)
    await sharp.default(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(join(publicDir, 'apple-touch-icon.png'));
    console.log('✅ Generated apple-touch-icon.png');

    // Generate 32x32 favicon
    await sharp.default(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(join(publicDir, 'favicon-32x32.png'));
    console.log('✅ Generated favicon-32x32.png');

    // Generate 16x16 favicon
    await sharp.default(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile(join(publicDir, 'favicon-16x16.png'));
    console.log('✅ Generated favicon-16x16.png');

    console.log('\n✨ All PWA icons generated successfully!');
    console.log('\nGenerated files:');
    console.log('  - icon-192x192.png (192x192)');
    console.log('  - icon-512x512.png (512x512)');
    console.log('  - apple-touch-icon.png (180x180)');
    console.log('  - favicon-32x32.png (32x32)');
    console.log('  - favicon-16x16.png (16x16)');

  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ERR_MODULE_NOT_FOUND') {
      console.error('\n❌ Error: sharp module not found');
      console.error('\nTo generate PNG icons, install sharp:');
      console.error('  pnpm add -D sharp');
      console.error('  tsx scripts/generate-icons.ts');
      console.error('\nAlternatively, use an online tool:');
      console.error('  1. Visit https://realfavicongenerator.net/');
      console.error('  2. Upload public/icon.svg');
      console.error('  3. Download and extract to public/ directory');
      process.exit(1);
    }
    throw error;
  }
}

void generateIcons();
