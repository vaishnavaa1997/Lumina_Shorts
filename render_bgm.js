/**
 * ============================================================================
 * LUMINA SHORTS STUDIO (9:16 VERTICAL — 1080x1920)
 * FAST HEADLESS 48kHz SITUATIONAL & CULTURAL BGM RENDERER (render_bgm.js)
 * ============================================================================
 * Usage:
 *   node render_bgm.js <project_folder_name> [bgmOnly|bgmFull]
 *
 * Opens projects/<project_folder_name>/bgm_master.html in headless Chromium,
 * synthesizes the entire Short's continuous situational & cultural BGM score
 * via WebAudio OfflineAudioContext at 48,000 Hz Stereo, and writes:
 *   projects/<project_folder_name>/build/bgm_master.wav
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const SAMPLE_RATE = 48000;

function writeWavFromInt16Buffer(filePath, pcmBuffer, sampleRate = SAMPLE_RATE, numChannels = 2) {
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  fs.writeFileSync(filePath, Buffer.concat([header, pcmBuffer]));
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node render_bgm.js <project_folder_name> [bgmOnly|bgmFull]');
    process.exit(1);
  }

  const project = args[0];
  const mixMode = args[1] || 'bgmOnly';

  const rootDir = __dirname;
  const projectDir = path.isAbsolute(project) ? project : path.join(rootDir, 'projects', project);
  const bgmHtmlPath = path.join(projectDir, 'bgm_master.html');

  if (!fs.existsSync(bgmHtmlPath)) {
    console.error(`[BGM] bgm_master.html not found at: ${bgmHtmlPath}`);
    process.exit(1);
  }

  const buildDir = path.join(projectDir, 'build');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  const outWavPath = path.join(buildDir, 'bgm_master.wav');
  const startMs = Date.now();

  console.log(`==================================================================`);
  console.log(`LUMINA SHORTS — HEADLESS 48kHz SITUATIONAL BGM RENDERER`);
  console.log(`Source   : ${bgmHtmlPath}`);
  console.log(`Mix Mode : ${mixMode}`);
  console.log(`==================================================================`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--allow-file-access-from-files',
      '--disable-web-security'
    ]
  });

  try {
    const page = await browser.newPage();
    const fileUrl = 'file:///' + bgmHtmlPath.replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 60000 });

    const meta = await page.evaluate(async (sr, mode) => {
      const scoreFn = window.scoreBGM || window.scoreSound;
      const dur = Number(window.DURATION || (window.BGM_SCORE && window.BGM_SCORE.total_duration) || 45);
      if (!window.SOUND || typeof window.SOUND.renderOffline !== 'function' || typeof scoreFn !== 'function') {
        throw new Error('SOUND.renderOffline or scoreBGM not found in bgm_master.html');
      }

      const res = await window.SOUND.renderOffline(scoreFn, dur, sr, { mixMode: mode });
      const inter = res.inter;
      const int16 = new Int16Array(inter.length);
      for (let i = 0; i < inter.length; i++) {
        const s = Math.max(-1, Math.min(1, inter[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      window.__BGM_PCM_BYTES__ = new Uint8Array(int16.buffer);
      return {
        duration: dur,
        cues: window.BGM_SCORE && window.BGM_SCORE.cues ? window.BGM_SCORE.cues.length : 0,
        byteLength: window.__BGM_PCM_BYTES__.byteLength
      };
    }, SAMPLE_RATE, mixMode);

    console.log(`[BGM] Synthesized ${meta.duration.toFixed(1)}s across ${meta.cues} situational cues. Streaming PCM...`);

    const chunkSize = 524288;
    const chunks = [];
    for (let offset = 0; offset < meta.byteLength; offset += chunkSize) {
      const b64 = await page.evaluate((start, len) => {
        const slice = window.__BGM_PCM_BYTES__.subarray(start, Math.min(start + len, window.__BGM_PCM_BYTES__.byteLength));
        let binary = '';
        const step = 0x8000;
        for (let i = 0; i < slice.length; i += step) {
          binary += String.fromCharCode.apply(null, slice.subarray(i, i + step));
        }
        return btoa(binary);
      }, offset, chunkSize);
      chunks.push(Buffer.from(b64, 'base64'));
    }

    const pcmBuffer = Buffer.concat(chunks);
    writeWavFromInt16Buffer(outWavPath, pcmBuffer, SAMPLE_RATE, 2);

    const elapsed = ((Date.now() - startMs) / 1000).toFixed(2);
    console.log(`[BGM] Saved 48kHz Stereo WAV (${(pcmBuffer.length / (1024 * 1024)).toFixed(2)} MB) in ${elapsed}s:`);
    console.log(`      ${outWavPath}`);
    console.log(`==================================================================\n`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('\n[BGM RENDER ERROR]', err);
  process.exit(1);
});