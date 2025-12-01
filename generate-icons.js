// Simple script to generate icon data URIs
// Run this in browser console to get base64 PNG data

const generateIcon = (size) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#8b5cf6");
  gradient.addColorStop(1, "#ec4899");

  // Draw rounded rectangle
  const radius = size * 0.2;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Draw heart shape
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  const centerX = size / 2;
  const centerY = size / 2;
  const heartSize = size * 0.15;

  ctx.beginPath();
  ctx.moveTo(centerX, centerY + heartSize);
  ctx.bezierCurveTo(
    centerX,
    centerY,
    centerX - heartSize,
    centerY - heartSize,
    centerX - heartSize * 1.5,
    centerY - heartSize
  );
  ctx.bezierCurveTo(
    centerX - heartSize * 2.5,
    centerY - heartSize,
    centerX - heartSize * 2.5,
    centerY,
    centerX,
    centerY + heartSize * 2
  );
  ctx.bezierCurveTo(
    centerX + heartSize * 2.5,
    centerY,
    centerX + heartSize * 2.5,
    centerY - heartSize,
    centerX + heartSize * 1.5,
    centerY - heartSize
  );
  ctx.bezierCurveTo(
    centerX + heartSize,
    centerY - heartSize,
    centerX,
    centerY,
    centerX,
    centerY + heartSize
  );
  ctx.closePath();
  ctx.fill();

  // Draw circle
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.beginPath();
  ctx.arc(centerX, centerY - heartSize * 0.3, heartSize * 0.4, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL("image/png");
};

// Generate icons
const icon180 = generateIcon(180);
const icon192 = generateIcon(192);
const icon512 = generateIcon(512);

console.log("180x180 (iOS):", icon180.substring(0, 100) + "...");
console.log("192x192:", icon192.substring(0, 100) + "...");
console.log("512x512:", icon512.substring(0, 100) + "...");

// Create download links
const download = (dataUrl, filename) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
};

// Uncomment to download:
// download(icon180, 'icon-180.png');
// download(icon192, 'icon-192.png');
// download(icon512, 'icon-512.png');
