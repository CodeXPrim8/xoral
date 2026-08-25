import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')
mkdirSync(dir, { recursive: true })

function markSvg(size, pad = 0) {
  const inset = Math.round(size * pad)
  const inner = size - inset * 2
  const stroke = Math.max(10, Math.round(inner * 0.14))
  const x1 = inset + inner * 0.22
  const y1 = inset + inner * 0.2
  const x2 = inset + inner * 0.78
  const y2 = inset + inner * 0.8
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#050308"/>
  <path d="M${x1} ${y1} L${x2} ${y2} M${x2} ${y1} L${x1} ${y2}" fill="none" stroke="#e8c36a" stroke-width="${stroke}" stroke-linecap="round"/>
</svg>`
}

async function png(name, size, pad = 0) {
  const buf = await sharp(Buffer.from(markSvg(size, pad))).png().toBuffer()
  writeFileSync(join(dir, name), buf)
}

await png('icon-192.png', 192, 0.08)
await png('icon-512.png', 512, 0.08)
await png('icon-512-maskable.png', 512, 0.18)
await png('apple-touch-icon.png', 180, 0.1)
await sharp(Buffer.from(markSvg(192, 0.08))).png().toFile(join(dir, '..', 'icon.png'))
console.log('PWA icons written to public/icons')
