import { chromium } from 'playwright-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(distDir, reqPath === '/' ? 'index.html' : reqPath);
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) filePath += '.html';
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.webp': 'image/webp',
      '.jpg': 'image/jpeg',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
    };
    res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(4329, async () => {
  console.log('Static audit server running on 4329');
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: ['--no-sandbox']
    });

    const outDir = 'C:\\Users\\wogus\\.gemini\\antigravity\\brain\\66fb9482-d14c-4494-8fb4-5213323bfc7b\\hub-audit';
    fs.mkdirSync(outDir, { recursive: true });

    const viewports = [
      { name: 'pc', width: 1440, height: 900 },
      { name: 'mo', width: 390, height: 844 },
    ];

    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto('http://localhost:4329/sitemap-seoul.html', { waitUntil: 'networkidle' });

      // Check overflow
      const overflow = await page.evaluate(() => {
        const docElem = document.documentElement;
        const body = document.body;
        return {
          docScrollWidth: docElem.scrollWidth,
          docClientWidth: docElem.clientWidth,
          bodyScrollWidth: body.scrollWidth,
          bodyClientWidth: body.clientWidth,
          hasHorizontalScroll: docElem.scrollWidth > docElem.clientWidth || body.scrollWidth > body.clientWidth
        };
      });

      const shotPath = path.join(outDir, `sitemap-seoul-${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });

      console.log(`[${vp.name.toUpperCase()} Viewport]`);
      console.log(`  Dimensions: ${vp.width}x${vp.height}`);
      console.log(`  Doc scroll/client: ${overflow.docScrollWidth} / ${overflow.docClientWidth}`);
      console.log(`  Horizontal overflow: ${overflow.hasHorizontalScroll ? 'FAIL (OVERFLOW)' : 'PASS (NO OVERFLOW)'}`);
      console.log(`  Screenshot saved: ${shotPath}`);

      await page.close();
    }
  } catch (err) {
    console.error('Audit failed:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
