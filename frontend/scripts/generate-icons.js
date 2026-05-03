#!/usr/bin/env node

/**
 * Generate PWA Icons from SVG
 * Creates icon variants for different devices and uses
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, "../public");
const iconSvg = path.join(publicDir, "icon.svg");

// Icon sizes and their purposes
const iconSizes = [
  { size: 192, name: "icon-192.png" },
  { size: 512, name: "icon-512.png" },
];

const maskableSizes = [
  { size: 192, name: "icon-192-maskable.png" },
  { size: 512, name: "icon-512-maskable.png" },
];

/**
 * Create a regular icon with padding
 */
async function createRegularIcon(size, filename) {
  try {
    await sharp(iconSvg)
      .resize(size - 20, size - 20) // Leave 10px padding
      .png()
      .toFile(path.join(publicDir, filename));
    console.log(`✓ Created ${filename}`);
  } catch (error) {
    console.error(`✗ Error creating ${filename}:`, error.message);
  }
}

/**
 * Create a maskable icon (full size, no padding for Android adaptive icons)
 */
async function createMaskableIcon(size, filename) {
  try {
    await sharp(iconSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, filename));
    console.log(`✓ Created ${filename} (maskable)`);
  } catch (error) {
    console.error(`✗ Error creating ${filename}:`, error.message);
  }
}

/**
 * Create screenshot placeholders
 */
async function createScreenshot(width, height, filename) {
  try {
    // Create a simple screenshot using the icon scaled up
    await sharp(iconSvg)
      .resize(Math.min(width, height), Math.min(width, height))
      .png()
      .composite([
        {
          input: Buffer.from(
            `<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="#1a1a1a"/></svg>`
          ),
          blend: "dest-over",
        },
      ])
      .resize(width, height, { fit: "contain", background: { r: 26, g: 26, b: 26 } })
      .png()
      .toFile(path.join(publicDir, filename));
    console.log(`✓ Created ${filename}`);
  } catch (error) {
    console.error(`✗ Error creating ${filename}:`, error.message);
  }
}

async function generateIcons() {
  console.log("🎨 Generating PWA icons from SVG...\n");

  // Check if icon.svg exists
  if (!fs.existsSync(iconSvg)) {
    console.error(`✗ Icon file not found: ${iconSvg}`);
    process.exit(1);
  }

  // Generate regular icons
  for (const icon of iconSizes) {
    await createRegularIcon(icon.size, icon.name);
  }

  console.log();

  // Generate maskable icons
  for (const icon of maskableSizes) {
    await createMaskableIcon(icon.size, icon.name);
  }

  console.log();

  // Generate screenshots
  console.log("📸 Creating screenshot placeholders...\n");
  await createScreenshot(540, 720, "screenshot-540.png");
  await createScreenshot(1280, 720, "screenshot-1280.png");

  console.log("\n✅ Icon generation complete!");
  console.log("📦 Generated files are ready in public/");
}

generateIcons();
