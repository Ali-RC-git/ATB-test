/**
 * Convert SVG logo to PNG
 *
 * Install dependencies:
 *   npm install sharp
 *
 * Run:
 *   node convert-logo.js
 */

const fs = require("fs");
const path = require("path");

// Check if sharp is available
let sharp;
try {
  sharp = require("sharp");
} catch (error) {
  console.error("❌ Error: sharp is not installed");
  console.error("📦 Install it with: npm install sharp");
  process.exit(1);
}

async function convertLogo() {
  const publicDir = path.join(__dirname, "public");
  const svgFile = path.join(publicDir, "logo-simple.svg");
  const output512 = path.join(publicDir, "heart.png");
  const output192 = path.join(publicDir, "heart-192.png");

  // Check if SVG exists
  if (!fs.existsSync(svgFile)) {
    console.error(`❌ Error: ${svgFile} not found`);
    console.error("   Make sure logo-simple.svg exists in the public folder");
    process.exit(1);
  }

  try {
    const svg = fs.readFileSync(svgFile);

    console.log("🔄 Converting logo...");

    // Create 512x512 version (main logo)
    await sharp(svg)
      .resize(512, 512, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(output512);

    console.log("✅ Created heart.png (512x512)");

    // Create 192x192 version (small icon)
    await sharp(svg)
      .resize(192, 192, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(output192);

    console.log("✅ Created heart-192.png (192x192)");
    console.log("");
    console.log("🎉 Logo conversion complete!");
    console.log("   Files created:");
    console.log(`   - ${output512}`);
    console.log(`   - ${output192}`);
    console.log("");
    console.log("💡 Tip: You can use heart.png for your app icon");
  } catch (error) {
    console.error("❌ Error converting logo:", error.message);
    process.exit(1);
  }
}

convertLogo();
