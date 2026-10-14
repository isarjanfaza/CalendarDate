import { defineConfig } from 'tsup';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Disable DTS generation for now due to test issues
  splitting: false,
  sourcemap: true,
  clean: true,
  banner: {
    js: `/* CalendarDate - Gregorian Calendar Widget */`,
  },
  onSuccess() {
    // Copy CSS file to dist
    const srcCss = join(process.cwd(), 'src/styles/dualcal.css');
    const distCss = join(process.cwd(), 'dist/dualcal.css');
    const cssContent = readFileSync(srcCss, 'utf-8');
    writeFileSync(distCss, cssContent);
    console.log('Copied CSS to dist/dualcal.css');
  },
});
