// Run with: node generate-icons.js
// Generates PWA PNG icons using only Node.js built-ins (no dependencies)
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function crc32(buf) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

function generateIconPNG(size) {
  // Colors
  const BG = [79, 70, 229];   // #4f46e5 indigo
  const FG = [255, 255, 255]; // white
  const DARK = [55, 48, 163]; // darker indigo for depth

  const pixels = Buffer.alloc(size * size * 3);

  // Fill pixel buffer with colors based on shape
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const off = (y * size + x) * 3;
      const nx = x / size, ny = y / size; // normalized 0..1

      // Default: indigo background
      let [r, g, b] = BG;

      // Rounded corners (radius 18%)
      const radius = 0.18;
      const cx = Math.min(nx, 1 - nx), cy = Math.min(ny, 1 - ny);
      if (cx < radius && cy < radius) {
        const dx = radius - cx, dy = radius - cy;
        if (Math.sqrt(dx * dx + dy * dy) > radius) { r = 255; g = 255; b = 255; } // outside = white (transparent effect)
      }

      // Graduation cap mortarboard (top portion, roughly center)
      // Diamond/rhombus shape: y in [0.22..0.42], centered
      const capY1 = 0.22, capY2 = 0.42;
      const capXCenter = 0.50;
      if (ny >= capY1 && ny <= capY2) {
        const capHeight = (capY2 - capY1);
        const halfW = 0.38; // half width of cap base
        if (Math.abs(nx - capXCenter) <= halfW) {
          [r, g, b] = FG;
        }
      }

      // Cap stem/tassel: right side vertical bar
      const stemX1 = 0.72, stemX2 = 0.76;
      const stemY1 = 0.34, stemY2 = 0.52;
      if (nx >= stemX1 && nx <= stemX2 && ny >= stemY1 && ny <= stemY2) {
        [r, g, b] = FG;
      }
      // Tassel ball
      const ballDist = Math.sqrt(Math.pow(nx - 0.74, 2) + Math.pow(ny - 0.53, 2));
      if (ballDist <= 0.04) [r, g, b] = FG;

      // Cap gown/body arc (trapezoid below cap diamond)
      const gownY1 = 0.38, gownY2 = 0.58;
      const gownXLeft = 0.22, gownXRight = 0.78;
      if (ny >= gownY1 && ny <= gownY2) {
        const t = (ny - gownY1) / (gownY2 - gownY1);
        const xLeft = gownXLeft + t * 0.05;
        const xRight = gownXRight - t * 0.05;
        if (nx >= xLeft && nx <= xRight) {
          [r, g, b] = FG;
        }
      }

      // "S4L" text rendered as simple pixel blocks
      // S: y 0.65..0.86, x 0.13..0.37
      // 4: y 0.65..0.86, x 0.40..0.60
      // L: y 0.65..0.86, x 0.63..0.87
      const px = Math.floor(nx * 100), py = Math.floor(ny * 100);

      // Letter S (simplified pixel font)
      const S = [
        [14,65],[15,65],[16,65],[17,65],[18,65],[19,65],[20,65],[21,65],[22,65],[23,65],[24,65],[25,65],[26,65],
        [14,66],[14,67],[14,68],[14,69],[14,70],[14,71],[14,72],[14,73],[14,74],
        [14,75],[15,75],[16,75],[17,75],[18,75],[19,75],[20,75],[21,75],[22,75],[23,75],[24,75],[25,75],[26,75],
        [26,76],[26,77],[26,78],[26,79],[26,80],[26,81],[26,82],[26,83],[26,84],
        [14,85],[15,85],[16,85],[17,85],[18,85],[19,85],[20,85],[21,85],[22,85],[23,85],[24,85],[25,85],[26,85],
      ];

      // Letter 4
      const FOUR = [
        [40,65],[40,66],[40,67],[40,68],[40,69],[40,70],[40,71],[40,72],[40,73],[40,74],[40,75],
        [40,75],[41,75],[42,75],[43,75],[44,75],[45,75],[46,75],[47,75],[48,75],[49,75],[50,75],[51,75],[52,75],
        [52,65],[52,66],[52,67],[52,68],[52,69],[52,70],[52,71],[52,72],[52,73],[52,74],[52,75],[52,76],[52,77],[52,78],[52,79],[52,80],[52,81],[52,82],[52,83],[52,84],[52,85],
      ];

      // Letter L
      const L_LETTER = [
        [63,65],[63,66],[63,67],[63,68],[63,69],[63,70],[63,71],[63,72],[63,73],[63,74],[63,75],[63,76],[63,77],[63,78],[63,79],[63,80],[63,81],[63,82],[63,83],[63,84],[63,85],
        [63,85],[64,85],[65,85],[66,85],[67,85],[68,85],[69,85],[70,85],[71,85],[72,85],[73,85],[74,85],[75,85],[76,85],[77,85],[78,85],[79,85],[80,85],[81,85],[82,85],[83,85],
      ];

      const inS = S.some(([cx, cy]) => Math.abs(px - cx) <= 1 && Math.abs(py - cy) <= 1);
      const in4 = FOUR.some(([cx, cy]) => Math.abs(px - cx) <= 1 && Math.abs(py - cy) <= 1);
      const inL = L_LETTER.some(([cx, cy]) => Math.abs(px - cx) <= 1 && Math.abs(py - cy) <= 1);

      if (inS || in4 || inL) [r, g, b] = FG;

      // Skip outside rounded corners (already set to white — use BG for PNG transparency effect)
      // Actually we'll keep white for border to show shape
      pixels[off] = r; pixels[off + 1] = g; pixels[off + 2] = b;
    }
  }

  const rowLen = size * 3;
  const raw = Buffer.alloc((rowLen + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (rowLen + 1)] = 0;
    pixels.copy(raw, y * (rowLen + 1) + 1, y * rowLen, (y + 1) * rowLen);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([sig, makeChunk('IHDR', ihdr), makeChunk('IDAT', zlib.deflateSync(raw)), makeChunk('IEND', Buffer.alloc(0))]);
}

const iconsDir = path.join(__dirname, 'public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), generateIconPNG(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), generateIconPNG(512));
console.log('✅ Icons generated: public/icons/icon-192.png, public/icons/icon-512.png');
