import { defineConfig } from 'tsup';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  noExternal: ['jalaali-js'],
  // Bundle jalaali-js for easier usage in examples
  banner: {
    js: `/* dualcal - Persian (Jalali) + Gregorian Calendar Widget */`,
  },
  onSuccess() {
    // Copy CSS file to dist (with modified font paths for dev)
    const srcCss = join(process.cwd(), 'src/styles/dualcal.css');
    const distCss = join(process.cwd(), 'dist/dualcal.css');
    let cssContent = readFileSync(srcCss, 'utf-8');
    // Replace font paths for dev/example
    cssContent = cssContent.replace(/url\('\.\/IRANSansX/g, "url('/public/IRANSansX");
    writeFileSync(distCss, cssContent);
    console.log('Copied CSS to dist/dualcal.css');

    // Copy font files to public for development
    const fontsDir = join(process.cwd(), 'fonts');
    const publicDir = join(process.cwd(), 'public');
    
    if (existsSync(fontsDir)) {
      if (!existsSync(publicDir)) {
        mkdirSync(publicDir, { recursive: true });
      }
      copyFileSync(join(fontsDir, 'IRANSansX-Regular.woff2'), join(publicDir, 'IRANSansX-Regular.woff2'));
      copyFileSync(join(fontsDir, 'IRANSansX-Bold.woff2'), join(publicDir, 'IRANSansX-Bold.woff2'));
      console.log('Copied fonts to public/');
    }
  },
});
