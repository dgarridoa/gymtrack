// Generates the PWA PNG icons (barbell glyph on a slate background)
// without any image-library dependency: raw RGBA pixels are encoded as a
// PNG by hand using node:zlib for the IDAT stream.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const BG = [245, 244, 239]; // chalk
const BAR = [26, 28, 33]; // iron
const PLATE = [200, 16, 46]; // IWF 25kg plate red

function crc32(buf) {
  let c,
    crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor RGB
  // Each scanline is prefixed with filter byte 0 (no filtering).
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    const row = y * (size * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixels(x, y);
      raw[row + 1 + x * 3] = r;
      raw[row + 2 + x * 3] = g;
      raw[row + 3 + x * 3] = b;
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Barbell drawn with axis-aligned rectangles in unit coordinates
// (fractions of the icon size): bar, inner plates, outer plates.
const rects = [
  { x0: 0.1, x1: 0.9, y0: 0.46, y1: 0.54, color: BAR },
  { x0: 0.22, x1: 0.3, y0: 0.28, y1: 0.72, color: PLATE },
  { x0: 0.7, x1: 0.78, y0: 0.28, y1: 0.72, color: PLATE },
  { x0: 0.14, x1: 0.2, y0: 0.34, y1: 0.66, color: PLATE },
  { x0: 0.8, x1: 0.86, y0: 0.34, y1: 0.66, color: PLATE },
];

function pixelAt(size) {
  return (x, y) => {
    const u = x / size;
    const v = y / size;
    for (const r of rects) {
      if (u >= r.x0 && u < r.x1 && v >= r.y0 && v < r.y1) return r.color;
    }
    return BG;
  };
}

mkdirSync(new URL("../public", import.meta.url), { recursive: true });
for (const [name, size] of [
  ["pwa-192.png", 192],
  ["pwa-512.png", 512],
  ["apple-touch-icon.png", 180],
]) {
  const out = new URL(`../public/${name}`, import.meta.url);
  writeFileSync(out, encodePng(size, pixelAt(size)));
  console.log(`wrote public/${name}`);
}
