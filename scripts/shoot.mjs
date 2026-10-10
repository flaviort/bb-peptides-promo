// QA screenshots over the Chrome DevTools protocol (Node 22, no dependencies).
// Needs a build made with NEXT_PUBLIC_DEBUG=1 so the debug URL params work.
// Env: CHROME, BASE, OUT, SECTIONS, FLAVORS, VIEWPORTS (comma list of names), TIMEOUT (ms to wait for the
// preloader to leave), SETTLE (ms after it leaves, for reveals and textures).
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE ?? 'http://localhost:3100';
const OUT = process.env.OUT ?? 'qa/shots';
const TIMEOUT = Number(process.env.TIMEOUT ?? 20000);
const SETTLE = Number(process.env.SETTLE ?? 3000);
const PORT = Number(process.env.CDP_PORT ?? 9334);
const ALL_VIEWPORTS = { desktop: [1440, 900], wide: [1920, 1080], mobile: [390, 844], laptop: [1280, 800] };
const DEFAULT_VIEWPORTS = 'desktop,wide,mobile'; // laptop is opt-in through VIEWPORTS
const VIEWPORTS = (process.env.VIEWPORTS ?? DEFAULT_VIEWPORTS).split(',');
const SECTIONS = (process.env.SECTIONS ?? 'hero,profile,benefit-1,benefit-2,benefit-3,benefit-4,statement,range,faq').split(',');
const FLAVORS = (process.env.FLAVORS ?? 'mango,peach,lemonade,cherry').split(',');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is still starting.
    }
    await sleep(200);
  }
  throw new Error('Chrome did not expose a page target');
}

function client(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  });
  const ready = new Promise((r) => ws.addEventListener('open', r, { once: true }));
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      pending.set(n, { resolve, reject });
      ws.send(JSON.stringify({ id: n, method, params }));
    });
  return { ready, send, close: () => ws.close() };
}

mkdirSync(OUT, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'hiatus-shoot-'));
const chrome = spawn(
  CHROME,
  [
    '--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars',
    '--autoplay-policy=no-user-gesture-required', '--mute-audio', '--no-first-run',
    `--user-data-dir=${profile}`, `--remote-debugging-port=${PORT}`, '--window-size=1440,900', 'about:blank',
  ],
  { stdio: 'ignore' },
);

let failed = 0;
try {
  const cdp = client(await connect());
  await cdp.ready;
  await cdp.send('Page.enable');
  for (const vp of VIEWPORTS) {
    const [w, h] = ALL_VIEWPORTS[vp];
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    for (const sec of SECTIONS) {
      for (const fl of FLAVORS) {
        const file = `${OUT}/${vp}-${sec}-${fl}.png`;
        try {
          await cdp.send('Page.navigate', { url: `${BASE}/?gate=skip&section=${sec}&flavor=${fl}` });
          await sleep(500);
          const until = Date.now() + TIMEOUT;
          for (;;) {
            const { result } = await cdp.send('Runtime.evaluate', {
              expression: "document.readyState === 'complete' && !document.querySelector('.preloader')",
            });
            if (result.value === true) break;
            if (Date.now() > until) throw new Error('preloader still on screen');
            await sleep(250);
          }
          await sleep(SETTLE);
          const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
          writeFileSync(file, Buffer.from(data, 'base64'));
          console.log(file);
        } catch (err) {
          failed++;
          console.error(`${file}: ${err.message}`);
        }
      }
    }
  }
  cdp.close();
} finally {
  chrome.kill();
  await sleep(300);
  rmSync(profile, { recursive: true, force: true });
}
if (failed) process.exitCode = 1;
