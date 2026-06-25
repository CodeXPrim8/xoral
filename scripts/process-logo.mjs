import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const publicDir = path.join(root, 'public');
const logoPath = path.join(publicDir, 'xoral-logo-dark.png');
const iconPath = path.join(publicDir, 'icon.png');
const legacyLogoPath = path.join(publicDir, 'xoral-logo.png');

// Match XORAL app background — solid black, no white matte
const BACKGROUND = { r: 0, g: 0, b: 0, alpha: 1 };

async function processLogo(inputPath, outputPath) {
  const image = sharp(inputPath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Remove white / light checkerboard matte and near-white fringes
    const isLight = r > 235 && g > 235 && b > 235;
    if (isLight || a < 16) {
      data[i] = BACKGROUND.r;
      data[i + 1] = BACKGROUND.g;
      data[i + 2] = BACKGROUND.b;
      data[i + 3] = 255;
      continue;
    }

    data[i + 3] = 255;
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .flatten({ background: BACKGROUND })
    .png()
    .toFile(outputPath);
}

const candidatePaths = [
  legacyLogoPath,
  path.join(
    root,
    '..',
    '..',
    '..',
    '.cursor',
    'projects',
    'c-Users-clemx-OneDrive-Desktop-XORA-STUDIOS',
    'assets',
    'c__Users_clemx_AppData_Roaming_Cursor_User_workspaceStorage_2430a7c9f10bca74e75c9c7ef3135b17_images_ChatGPT_Image_Jun_16__2026__05_35_41_PM-c57449d7-9f25-4120-a35f-5928f5369e3a.png'
  ),
];

let source = legacyLogoPath;
for (const candidate of candidatePaths) {
  if (fs.existsSync(candidate)) {
    source = candidate;
    break;
  }
}

await processLogo(source, logoPath);
await processLogo(source, iconPath);

console.log(`Logo processed from ${source}`);
console.log(`Updated ${logoPath} and ${iconPath}`);
