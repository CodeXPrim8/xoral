import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'public', 'xoral-logo-dark.png')
const dir = join(root, 'public', 'icons')
mkdirSync(dir, { recursive: true })

async function square(file, size, pad = 0) {
  const inner = Math.round(size * (1 - pad * 2))
  const buf = await sharp(src)
    .resize(inner, inner, { fit: 'contain', background: { r: 5, g: 3, b: 8, alpha: 1 } })
    .png()
    .toBuffer()
  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 5, g: 3, b: 8, alpha: 1 } },
  })
    .composite([{ input: buf, left: Math.round((size - inner) / 2), top: Math.round((size - inner) / 2) }])
    .png()
    .toFile(file)
}

await square(join(root, 'public', 'favicon.png'), 32)
await square(join(root, 'public', 'icon.png'), 192, 0.06)
await square(join(dir, 'icon-192.png'), 192, 0.06)
await square(join(dir, 'icon-512.png'), 512, 0.06)
await square(join(dir, 'icon-512-maskable.png'), 512, 0.16)
await square(join(dir, 'apple-touch-icon.png'), 180, 0.08)
await square(join(root, 'app', 'icon.png'), 512, 0.06)
await square(join(root, 'app', 'apple-icon.png'), 180, 0.08)
console.log('PWA icons written from xoral-logo-dark.png')
