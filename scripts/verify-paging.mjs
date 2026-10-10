// Headless check of paging, the FAQ jump during a page move, wheel-back and a menu jump.
// The in-app browser pane pauses animation frames when hidden, so scroll behaviour is checked here instead.
// Usage: npm run dev (port 3000), then: node scripts/verify-paging.mjs
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9341;
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

const profile = mkdtempSync(join(tmpdir(), 'bbp-verify-'));
const chrome = spawn(CHROME, ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', `--user-data-dir=${profile}`, `--remote-debugging-port=${PORT}`, '--window-size=1440,900', 'about:blank'], { stdio: 'ignore' });
const ev = async (cdp, expression) => (await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;
const key = async (cdp, k, code) => { for (const type of ['keyDown', 'keyUp']) await cdp.send('Input.dispatchKeyEvent', { type, key: k, code, windowsVirtualKeyCode: code === 'PageDown' ? 34 : 0 }); };
try {
  const cdp = client(await connect()); await cdp.ready; await cdp.send('Page.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Page.navigate', { url: 'http://localhost:3000/?intro=skip' });
  for (let i = 0; i < 80; i++) { if (await ev(cdp, "!document.querySelector('.preloader')")) break; await sleep(250); }
  await sleep(1500);
  const state = "JSON.stringify({ y: Math.round(scrollY), layer: [...document.querySelectorAll('.layer.is-active')].map(l=>l.getAttribute('aria-label')).join(), nav: document.querySelector('.nav').className, faqTop: Math.round(document.getElementById('faq').getBoundingClientRect().top), product: document.querySelector('.product-stack article:last-child h2')?.textContent })";
  console.log('start', await ev(cdp, state));
  await key(cdp, 'PageDown', 'PageDown'); await sleep(2000);
  console.log('after PageDown', await ev(cdp, state));
  await key(cdp, 'PageDown', 'PageDown'); await sleep(300);
  await ev(cdp, "document.querySelector('.nav-right .nav-link').click()"); await sleep(5000);
  console.log('after FAQ mid-page', await ev(cdp, state));
  for (let i = 0; i < 6; i++) { await cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 700, y: 450, deltaX: 0, deltaY: -800 }); await sleep(250); }
  await sleep(1500);
  console.log('after wheel up', await ev(cdp, state));
  await ev(cdp, "document.querySelector('.menu-toggle').click()"); await sleep(800);
  await ev(cdp, "[...document.querySelectorAll('.menu-link')][10].click()"); await sleep(4500);
  console.log('after menu jump to 11', await ev(cdp, state));
  cdp.close();
} finally { chrome.kill(); await sleep(300); rmSync(profile, { recursive: true, force: true }); }
