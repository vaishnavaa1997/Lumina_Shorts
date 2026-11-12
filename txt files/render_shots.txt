/**
 * ============================================================================
 * LUMINA SHORTS STUDIO (9:16 VERTICAL — 1080x1920 @ 60 FPS)
 * DETERMINISTIC PUPPETEER + WEBAUDIO + FFMPEG SHOT RENDERER & MERGER
 * ============================================================================
 * Usage Examples:
 *   1. Render all shots in a project + merge into final Short MP4:
 *      node render_shots.js my_short sfxOnly
 *
 *   2. Render only a specific batch HTML file:
 *      node render_shots.js my_short sfxOnly --batch shots_01_05.html
 *
 *   3. Re-render a single shot (e.g., Shot 4) in ~2 seconds:
 *      node render_shots.js my_short sfxOnly --shot 4
 *
 *   4. Merge existing build/shot_XX.mp4 (+ optional bgm_master.wav & vo.wav):
 *      node render_shots.js my_short sfxOnly --merge-only
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const puppeteer = require('puppeteer');

// 9:16 Vertical YouTube Shorts Master Constants
const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 60;
const SAMPLE_RATE = 48000;

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node render_shots.js <project_folder_name> [sfxOnly|mute] [--batch <file.html>] [--shot <N>] [--merge-only]');
    process.exit(1);
  }

  const config = {
    project: args[0],
    mixMode: 'sfxOnly',
    batchFile: null,
    singleShot: null,
    mergeOnly: false,
    jpegQuality: 96
  };

  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === '--batch' && args[i + 1]) {
      config.batchFile = args[++i];
    } else if (a === '--shot' && args[i + 1]) {
      config.singleShot = parseInt(args[++i], 10);
    } else if (a === '--merge-only') {
      config.mergeOnly = true;
    } else if (a === '--quality' && args[i + 1]) {
      config.jpegQuality = parseInt(args[++i], 10);
    } else if (!a.startsWith('--')) {
      config.mixMode = a;
    }
  }
  return config;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

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
  header.writeUInt32LE(16, 16);             // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20);              // AudioFormat (1 = PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34);             // BitsPerSample (16-bit)
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  fs.writeFileSync(filePath, Buffer.concat([header, pcmBuffer]));
}

function writeSilentWav(filePath, durationSec, sampleRate = SAMPLE_RATE) {
  const totalFrames = Math.max(1, Math.round(durationSec * sampleRate));
  const pcmBuffer = Buffer.alloc(totalFrames * 2 * 2, 0);
  writeWavFromInt16Buffer(filePath, pcmBuffer, sampleRate, 2);
}

/**
 * Finds all batch HTML files (shots_*.html or shot_*.html) in the project folder
 */
function discoverBatchFiles(projectDir, specificBatch) {
  if (specificBatch) {
    const p = path.isAbsolute(specificBatch) ? specificBatch : path.join(projectDir, specificBatch);
    if (!fs.existsSync(p)) {
      throw new Error(`Batch file not found: ${p}`);
    }
    return [p];
  }

  const allFiles = fs.readdirSync(projectDir);
  const batchFiles = allFiles
    .filter((f) => /^shots?_\d+.*\.html$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => path.join(projectDir, f));

  return batchFiles;
}

/**
 * Renders the offline WebAudio track for an entire batch HTML inside Chromium
 * and returns a Node Buffer of interleaved 16-bit stereo PCM samples.
 */
async function renderBatchAudioPCM(page, durationSec, mixMode) {
  if (mixMode === 'mute') {
    const totalFrames = Math.max(1, Math.round(durationSec * SAMPLE_RATE));
    return Buffer.alloc(totalFrames * 4, 0);
  }

  const meta = await page.evaluate(async (dur, sr, mode) => {
    if (!window.SOUND || typeof window.SOUND.renderOffline !== 'function' || typeof window.scoreSound !== 'function') {
      return { ok: false };
    }
    const res = await window.SOUND.renderOffline(window.scoreSound, dur, sr, { mixMode: mode });
    const inter = res.inter; // Float32Array (interleaved L, R)
    const int16 = new Int16Array(inter.length);
    for (let i = 0; i < inter.length; i++) {
      const s = Math.max(-1, Math.min(1, inter[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    window.__BATCH_PCM_BYTES__ = new Uint8Array(int16.buffer);
    return {
      ok: true,
      byteLength: window.__BATCH_PCM_BYTES__.byteLength
    };
  }, durationSec, SAMPLE_RATE, mixMode);

  if (!meta || !meta.ok) {
    const totalFrames = Math.max(1, Math.round(durationSec * SAMPLE_RATE));
    return Buffer.alloc(totalFrames * 4, 0);
  }

  // Pull PCM bytes in fast 512KB Base64 chunks
  const chunkSize = 524288;
  const chunks = [];
  for (let offset = 0; offset < meta.byteLength; offset += chunkSize) {
    const b64 = await page.evaluate((start, len) => {
      const slice = window.__BATCH_PCM_BYTES__.subarray(start, Math.min(start + len, window.__BATCH_PCM_BYTES__.byteLength));
      let binary = '';
      const step = 0x8000;
      for (let i = 0; i < slice.length; i += step) {
        binary += String.fromCharCode.apply(null, slice.subarray(i, i + step));
      }
      return btoa(binary);
    }, offset, chunkSize);
    chunks.push(Buffer.from(b64, 'base64'));
  }

  await page.evaluate(() => { delete window.__BATCH_PCM_BYTES__; });
  return Buffer.concat(chunks);
}

/**
 * Slices a single shot's stereo 16-bit PCM bytes from the batch PCM buffer
 */
function sliceShotPCM(batchPCM, batchStart, shotStart, shotDuration) {
  const localStartSec = Math.max(0, shotStart - batchStart);
  const startFrame = Math.round(localStartSec * SAMPLE_RATE);
  const frameCount = Math.max(1, Math.round(shotDuration * SAMPLE_RATE));

  const byteStart = startFrame * 4; // 2 channels * 2 bytes per sample
  const byteLen = frameCount * 4;
  const out = Buffer.alloc(byteLen, 0);

  if (byteStart < batchPCM.length) {
    const copyEnd = Math.min(batchPCM.length, byteStart + byteLen);
    batchPCM.copy(out, 0, byteStart, copyEnd);
  }
  return out;
}

/**
 * Renders a single shot (1080x1920 @ 60fps) by stepping `window.seek()`
 * and piping JPEG frames directly to FFmpeg together with the shot's WAV file.
 */
async function renderSingleShotMP4(page, shot, wavPath, outMp4Path, jpegQuality) {
  const totalFrames = Math.max(1, Math.round(shot.duration * FPS));
  const startMs = Date.now();

  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-framerate', String(FPS),
    '-i', '-',
    '-i', wavPath,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '16',
    '-pix_fmt', 'yuv420p',
    '-r', String(FPS),
    '-vf', `scale=${WIDTH}:${HEIGHT}:flags=lanczos`,
    '-c:a', 'aac',
    '-b:a', '192k',
    '-ar', String(SAMPLE_RATE),
    '-ac', '2',
    '-shortest',
    '-movflags', '+faststart',
    outMp4Path
  ];

  const ff = spawn('ffmpeg', ffmpegArgs, { stdio: ['pipe', 'ignore', 'pipe'] });
  let ffErr = '';
  ff.stderr.on('data', (d) => { ffErr += d.toString(); });

  const ffClosePromise = new Promise((resolve, reject) => {
    ff.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}:\n${ffErr}`));
    });
    ff.on('error', reject);
  });

  const qNorm = Math.max(0.5, Math.min(1.0, jpegQuality / 100));

  for (let f = 0; f < totalFrames; f++) {
    // Sample frame center for rock-solid boundary stability
    const gt = shot.start + (f + 0.5) / FPS;

    const b64Frame = await page.evaluate((targetGt, quality) => {
      window.seek(targetGt, { global: true });
      const cv = document.getElementById('stage');
      const dataUrl = cv.toDataURL('image/jpeg', quality);
      return dataUrl.substring(dataUrl.indexOf(',') + 1);
    }, gt, qNorm);

    const frameBuf = Buffer.from(b64Frame, 'base64');
    const canContinue = ff.stdin.write(frameBuf);
    if (!canContinue) {
      await new Promise((r) => ff.stdin.once('drain', r));
    }

    if ((f + 1) % 30 === 0 || f === totalFrames - 1) {
      const pct = (((f + 1) / totalFrames) * 100).toFixed(0);
      process.stdout.write(`\r   -> Shot ${pad2(shot.shot_number)} [${shot.title || ''}]: Frame ${f + 1}/${totalFrames} (${pct}%)`);
    }
  }

  ff.stdin.end();
  await ffClosePromise;
  const elapsed = ((Date.now() - startMs) / 1000).toFixed(2);
  process.stdout.write(` — Done in ${elapsed}s\n`);
}

/**
 * Stitches all build/shot_XX.mp4 files in numerical order and mixes
 * optional build/bgm_master.wav and vo.wav into build/final_episode_master.mp4
 */
function mergeAllShots(projectDir, buildDir) {
  const shotFiles = fs.readdirSync(buildDir)
    .filter((f) => /^shot_\d+\.mp4$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (shotFiles.length === 0) {
    console.warn('\n[MERGE] No build/shot_XX.mp4 files found to merge.');
    return;
  }

  console.log(`\n==================================================================`);
  console.log(`[MERGE] Stitching ${shotFiles.length} vertical 9:16 shots (${WIDTH}x${HEIGHT} @ ${FPS}fps)...`);

  const concatListPath = path.join(buildDir, 'concat_list.txt');
  const concatLines = shotFiles.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join('\n');
  fs.writeFileSync(concatListPath, concatLines, 'utf8');

  const stitchedSfxMp4 = path.join(buildDir, 'final_shorts_sfx_only.mp4');
  const finalMasterMp4 = path.join(buildDir, 'final_episode_master.mp4');

  // Step A: Lossless concat of all shot_XX.mp4 into final_shorts_sfx_only.mp4
  execFileSync('ffmpeg', [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatListPath,
    '-c', 'copy',
    '-movflags', '+faststart',
    stitchedSfxMp4
  ], { stdio: 'ignore' });

  const bgmWavPath = path.join(buildDir, 'bgm_master.wav');
  const voWavPath = path.join(projectDir, 'vo.wav');
  const hasBgm = fs.existsSync(bgmWavPath);
  const hasVo = fs.existsSync(voWavPath);

  if (!hasBgm && !hasVo) {
    fs.copyFileSync(stitchedSfxMp4, finalMasterMp4);
    console.log(`[MERGE] Created Master MP4 (SFX + Ambient bus): ${finalMasterMp4}`);
    return;
  }

  // Step B: Mix SFX bus + BGM bus (+ optional vo.wav) into final_episode_master.mp4
  const inputs = ['-i', stitchedSfxMp4];
  let filterParts = ['[0:a]volume=1.0[sfx]'];
  let mixLabels = '[sfx]';
  let inputCount = 1;

  if (hasBgm) {
    inputs.push('-i', bgmWavPath);
    filterParts.push(`[${inputCount}:a]volume=1.0[bgm]`);
    mixLabels += '[bgm]';
    inputCount++;
  }
  if (hasVo) {
    inputs.push('-i', voWavPath);
    filterParts.push(`[${inputCount}:a]volume=1.15[vo]`);
    mixLabels += '[vo]';
    inputCount++;
  }

  const amixFilter = `${filterParts.join(';')};${mixLabels}amix=inputs=${inputCount}:duration=first:dropout_transition=0:normalize=0[aout]`;

  execFileSync('ffmpeg', [
    '-y',
    ...inputs,
    '-filter_complex', amixFilter,
    '-map', '0:v:0',
    '-map', '[aout]',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '256k',
    '-ar', String(SAMPLE_RATE),
    '-ac', '2',
    '-movflags', '+faststart',
    finalMasterMp4
  ], { stdio: 'ignore' });

  console.log(`[MERGE] Stitched SFX-Only Track : ${stitchedSfxMp4}`);
  console.log(`[MERGE] Final Master Short MP4  : ${finalMasterMp4} (BGM: ${hasBgm ? 'YES' : 'NO'}, VO: ${hasVo ? 'YES' : 'NO'})`);
  console.log(`==================================================================\n`);
}

async function main() {
  const config = parseArgs();
  const rootDir = __dirname;
  const projectDir = path.isAbsolute(config.project)
    ? config.project
    : path.join(rootDir, 'projects', config.project);

  if (!fs.existsSync(projectDir)) {
    console.error(`[ERROR] Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  const buildDir = path.join(projectDir, 'build');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  if (config.mergeOnly) {
    mergeAllShots(projectDir, buildDir);
    return;
  }

  const batchFiles = discoverBatchFiles(projectDir, config.batchFile);
  if (batchFiles.length === 0) {
    console.error(`[ERROR] No shots_XX_YY.html batch files found in ${projectDir}`);
    process.exit(1);
  }

  console.log(`==================================================================`);
  console.log(`LUMINA SHORTS 9:16 RENDERER (${WIDTH}x${HEIGHT} @ ${FPS}fps)`);
  console.log(`Project  : ${projectDir}`);
  console.log(`Mix Mode : ${config.mixMode}`);
  if (config.singleShot !== null) console.log(`Target   : Single Shot #${config.singleShot}`);
  else if (config.batchFile) console.log(`Target   : Batch ${config.batchFile}`);
  else console.log(`Target   : All ${batchFiles.length} Batch File(s)`);
  console.log(`==================================================================`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--allow-file-access-from-files',
      '--disable-web-security',
      '--enable-gpu-rasterization',
      '--force-color-profile=srgb'
    ]
  });

  let renderedCount = 0;

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

    for (const batchPath of batchFiles) {
      const batchName = path.basename(batchPath);
      const fileUrl = 'file:///' + batchPath.replace(/\\/g, '/');

      await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.evaluate(async () => {
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
        if (typeof window.pause === 'function') window.pause();
      });

      const batchMeta = await page.evaluate(() => {
        const shots = (window.SHOTS || []).map((s) => ({
          shot_number: s.shot_number,
          title: s.title || '',
          start: Number(s.start),
          end: Number(s.end),
          duration: Number(s.duration || (s.end - s.start))
        }));
        const batchStart = window.BATCH_START !== undefined ? Number(window.BATCH_START) : (shots[0] ? shots[0].start : 0);
        const batchEnd = window.BATCH_END !== undefined ? Number(window.BATCH_END) : (shots.length ? shots[shots.length - 1].end : 0);
        return {
          shots,
          batchStart,
          batchEnd,
          duration: Math.max(0.01, batchEnd - batchStart)
        };
      });

      const targetShots = config.singleShot !== null
        ? batchMeta.shots.filter((s) => Number(s.shot_number) === config.singleShot)
        : batchMeta.shots;

      if (targetShots.length === 0) {
        continue;
      }

      console.log(`\n[BATCH] Loaded ${batchName} (${batchMeta.batchStart.toFixed(1)}s - ${batchMeta.batchEnd.toFixed(1)}s)`);
      console.log(`   -> Synthesizing 48kHz Offline WebAudio SFX + Ambient Bus...`);

      const batchPCM = await renderBatchAudioPCM(page, batchMeta.duration, config.mixMode);

      for (const shot of targetShots) {
        const shotNumStr = pad2(shot.shot_number);
        const tempWavPath = path.join(buildDir, `_tmp_shot_${shotNumStr}.wav`);
        const outMp4Path = path.join(buildDir, `shot_${shotNumStr}.mp4`);

        if (config.mixMode === 'mute') {
          writeSilentWav(tempWavPath, shot.duration, SAMPLE_RATE);
        } else {
          const shotPCM = sliceShotPCM(batchPCM, batchMeta.batchStart, shot.start, shot.duration);
          writeWavFromInt16Buffer(tempWavPath, shotPCM, SAMPLE_RATE, 2);
        }

        await renderSingleShotMP4(page, shot, tempWavPath, outMp4Path, config.jpegQuality);

        if (fs.existsSync(tempWavPath)) {
          fs.unlinkSync(tempWavPath);
        }
        renderedCount++;
      }
    }
  } finally {
    await browser.close();
  }

  if (renderedCount === 0 && config.singleShot !== null) {
    console.error(`\n[ERROR] Shot #${config.singleShot} was not found in any batch file.`);
    process.exit(1);
  }

  // Automatically stitch all shots if we rendered all batches
  if (config.singleShot === null && !config.batchFile) {
    mergeAllShots(projectDir, buildDir);
  } else {
    console.log(`\n[DONE] Rendered ${renderedCount} shot(s) into ${buildDir}`);
  }
}

main().catch((err) => {
  console.error('\n[FATAL RENDER ERROR]', err);
  process.exit(1);
});