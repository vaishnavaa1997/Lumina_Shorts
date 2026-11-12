/**
 * ============================================================================
 * LUMINA SHORTS STUDIO (9:16 VERTICAL — 1080x1920)
 * ROOT SYNCHRONOUS ENGINE AUTO-LOADER (engine.js)
 * ============================================================================
 * Included by any project HTML file via:
 *   <script src="../../engine.js"></script>
 *
 * Automatically resolves its own root directory and synchronously loads all 6
 * modular 9:16 engine files in exact dependency order before the project's
 * inline <script> executes:
 *   1. engine/lumina_base.js     (Core 1080x1920 Stage, 5-Plane Camera, Rig, UI, Sound, Transitions)
 *   2. engine/lumina_envs.js     (High-Density 9:16 5-Plane Environments & 32 3D Props)
 *   3. engine/lumina_teardown.js (2.5D Isometric Hardware Teardowns, Callouts & Upgrade Diffs)
 *   4. engine/lumina_maps.js     (Accurate [lon, lat] Vector Cartography, States & 3D Globes)
 *   5. engine/lumina_charts.js   (3D Extruded Charts, Line Graphs, Sankey & Scale Arenas)
 *   6. engine/lumina_physics.js  (Deterministic 120Hz Pre-Baked Rigid-Body, Shatter & Rope Physics)
 * ============================================================================
 */
(function () {
  'use strict';

  if (window.__LUMINA_SHORTS_ENGINE_LOADED__) return;
  window.__LUMINA_SHORTS_ENGINE_LOADED__ = true;

  const MODULES = [
    'engine/lumina_base.js',
    'engine/lumina_envs.js',
    'engine/lumina_teardown.js',
    'engine/lumina_maps.js',
    'engine/lumina_charts.js',
    'engine/lumina_physics.js'
  ];

  // Resolve base URL of this engine.js script
  let baseUrl = '';
  const currentScript = document.currentScript || (function () {
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const src = scripts[i].getAttribute('src') || '';
      if (src.indexOf('engine.js') !== -1) return scripts[i];
    }
    return scripts[scripts.length - 1];
  })();

  if (currentScript && currentScript.src) {
    baseUrl = currentScript.src.replace(/\/[^\/]*$/, '/');
  } else {
    baseUrl = '../../';
  }

  window.LUMINA_ENGINE_BASE_URL = baseUrl;
  window.LUMINA_SHORTS_VERSION = '2.5D-9x16-MODULAR-1080x1920';

  // Primary parser-blocking synchronous load (used during normal HTML parsing)
  if (document.readyState === 'loading') {
    for (let i = 0; i < MODULES.length; i++) {
      const fullSrc = baseUrl + MODULES[i];
      document.write('<script src="' + fullSrc + '"><\/script>');
    }
  } else {
    // Fallback synchronous loader if engine.js is injected after DOMContentLoaded
    for (let i = 0; i < MODULES.length; i++) {
      const fullSrc = baseUrl + MODULES[i];
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', fullSrc, false);
        xhr.send(null);
        if (xhr.status === 200 || xhr.status === 0) {
          const s = document.createElement('script');
          s.type = 'text/javascript';
          s.text = xhr.responseText + '\n//# sourceURL=' + fullSrc;
          document.head.appendChild(s);
        }
      } catch (err) {
        const s = document.createElement('script');
        s.src = fullSrc;
        s.async = false;
        document.head.appendChild(s);
      }
    }
  }
})();