import { existsSync } from "node:fs";
import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const logoPath = path.join(root, "public", "FLIPVISE_logo.png");
const assetsDir = path.join(root, "assets");

const SPLASH_SIZE = 2732;
const LOGO_SCALE = 0.62;
const BACKGROUND = { r: 10, g: 10, b: 10, alpha: 1 };

async function buildSplash() {
  const logoWidth = Math.round(SPLASH_SIZE * LOGO_SCALE);
  const logo = await sharp(logoPath)
    .resize(logoWidth, logoWidth, {
      fit: "contain",
      background: BACKGROUND,
    })
    .png()
    .toBuffer();

  const glow = await sharp({
    create: {
      width: SPLASH_SIZE,
      height: SPLASH_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${SPLASH_SIZE}" height="${SPLASH_SIZE}">
            <defs>
              <radialGradient id="g" cx="50%" cy="46%" r="34%">
                <stop offset="0%" stop-color="#22c55e" stop-opacity="0.22"/>
                <stop offset="100%" stop-color="#0a0a0a" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)"/>
          </svg>`,
        ),
        blend: "screen",
      },
    ])
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: SPLASH_SIZE,
      height: SPLASH_SIZE,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([
      { input: glow, gravity: "centre" },
      { input: logo, gravity: "centre" },
    ])
    .png()
    .toBuffer();
}

await mkdir(assetsDir, { recursive: true });

const splash = await buildSplash();
const splashPath = path.join(assetsDir, "splash.png");
const splashDarkPath = path.join(assetsDir, "splash-dark.png");

await sharp(splash).toFile(splashPath);
await sharp(splash).toFile(splashDarkPath);

const iconOnlyPath = path.join(assetsDir, "icon-only.png");
const iconForegroundPath = path.join(assetsDir, "icon-foreground.png");
const iconBackgroundPath = path.join(assetsDir, "icon-background.png");
const iconPath = path.join(assetsDir, "icon.png");

if (!existsSync(iconOnlyPath)) {
  await copyFile(iconPath, iconOnlyPath);
}
if (!existsSync(iconForegroundPath)) {
  await copyFile(iconPath, iconForegroundPath);
}
if (!existsSync(iconBackgroundPath)) {
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 3,
      background: BACKGROUND,
    },
  }).toFile(iconBackgroundPath);
}

console.log("Generated splash assets in assets/");
