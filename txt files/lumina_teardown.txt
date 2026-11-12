// ============================================================================
// MODULE 8: LUMINA_TEARDOWN (engine/lumina_teardown.js) — 9:16 VERTICAL SHORTS
// "hardcore-info" & "Zack D. Films" Inspired 2.5D Isometric Hardware Component
// Breakdowns, Spotlight Layer Isolation, Internal Physics Flows (Electrons,
// Thermal, Acoustic, Airflow), 9:16 Safe-Zone Orthogonal Leader-Line Callouts
// (UI.techCallout) & Generation Upgrade Diff Cards (UI.upgradeDiff).
// Soft-Volumetric 3D Gradients, Zero Black Outlines.
// Logical Stage: 1080x1920 (9:16 Vertical). Center-Stage Safe Zone:
// x: 100..880, y: 260..1440 (Hero Center: x = 500, y = 920).
// Deterministic fn(lt). Requires MODULE 1 (window.DK) & MODULE 3 (window.UI).
// ============================================================================
(function () {
  'use strict';

  const DK = (window.DK = window.DK || {});
  const H = (window.H = window.H || DK);
  const UI = (window.UI = window.UI || {});
  const E = (window.E = DK.E || {
    W: 1080,
    H: 1920,
    SAFE: { x0: 100, x1: 880, y0: 260, y1: 1440, cx: 500, cy: 920, groundY: 1340 },
  });
  const SAFE = E.SAFE || { x0: 100, x1: 880, y0: 260, y1: 1440, cx: 500, cy: 920, groundY: 1340 };

  const {
    clamp,
    lerp,
    prog,
    ease,
    rng,
    alpha,
    mix,
    shade,
    rr,
    circle,
    ellipse,
    ring,
    poly,
    seg,
    linGrad,
    radGrad,
    sphereGrad,
    cylinderGrad,
    contactShadow,
    glow,
    text,
    measure,
    FONTS,
  } = DK;

  // ---------- 1. 2.5D Isometric Projection & Extruded 3D Slab Primitives ----------
  // Converts local isometric (ix, iy, iz) coordinates into 2D screen space
  const ISO_COS = Math.cos(Math.PI / 6); // ~0.866025
  const ISO_SIN = Math.sin(Math.PI / 6); // 0.500000

  function isoPt(ix, iy, iz = 0) {
    return [(ix - iy) * ISO_COS, (ix + iy) * ISO_SIN - iz];
  }

  // Draws a soft-volumetric 3D extruded isometric rectangular/rounded slab
  function isoSlab(g, w, d, h, o = {}) {
    const col = o.color || '#64748B';
    const topCol = o.topColor || shade(col, 0.16);
    const leftCol = o.leftColor || shade(col, -0.12);
    const rightCol = o.rightColor || shade(col, -0.26);
    const rimCol = o.rimColor || shade(col, 0.32);
    const hw = w * 0.5;
    const hd = d * 0.5;

    const pTop = isoPt(-hw, -hd, h);
    const pRight = isoPt(hw, -hd, h);
    const pFront = isoPt(hw, hd, h);
    const pLeft = isoPt(-hw, hd, h);

    const bRight = isoPt(hw, -hd, 0);
    const bFront = isoPt(hw, hd, 0);
    const bLeft = isoPt(-hw, hd, 0);

    // Left vertical extrusion face
    poly(
      g,
      [pLeft, pFront, bFront, bLeft],
      linGrad(g, pLeft[0], pLeft[1], bFront[0], bFront[1], [leftCol, shade(leftCol, -0.12)])
    );

    // Right vertical extrusion face
    poly(
      g,
      [pFront, pRight, bRight, bFront],
      linGrad(g, pFront[0], pFront[1], bRight[0], bRight[1], [rightCol, shade(rightCol, -0.12)])
    );

    // Top surface face with 3D metallic/glass gradient
    poly(
      g,
      [pTop, pRight, pFront, pLeft],
      linGrad(g, pTop[0], pTop[1], pFront[0], pFront[1], [
        shade(topCol, 0.1),
        topCol,
        shade(topCol, -0.08),
      ]),
      rimCol,
      o.rimWidth !== undefined ? o.rimWidth : 1.5
    );

    // Optional glass specular sheen across top face
    if (o.glass) {
      poly(
        g,
        [
          isoPt(-hw * 0.75, -hd * 0.85, h),
          isoPt(-hw * 0.15, -hd * 0.85, h),
          isoPt(hw * 0.65, hd * 0.85, h),
          isoPt(hw * 0.05, hd * 0.85, h),
        ],
        'rgba(255, 255, 255, 0.22)'
      );
    }
  }

  // Draws an extruded 2.5D isometric cylinder/disc (for fans, magnets, turbine stages, lenses)
  function isoDisc(g, cx, cy, cz, rx, ry, h, o = {}) {
    const [sx, sy] = isoPt(cx, cy, cz);
    const col = o.color || '#94A3B8';
    g.save();
    g.translate(sx, sy);

    // Cylinder side wall
    if (h > 0) {
      g.fillStyle = cylinderGrad(g, -rx, -h, rx, 0, shade(col, -0.16), -1);
      g.beginPath();
      g.ellipse(0, -h, rx, ry, 0, 0, Math.PI, false);
      g.lineTo(-rx, 0);
      g.ellipse(0, 0, rx, ry, 0, Math.PI, 0, true);
      g.closePath();
      g.fill();
    }

    // Top ellipse face
    ellipse(g, 0, -h, rx, ry, sphereGrad(g, -rx * 0.2, -h - ry * 0.2, rx, shade(col, 0.14)));
    if (o.ringColor) {
      g.strokeStyle = o.ringColor;
      g.lineWidth = o.ringWidth || 2;
      g.beginPath();
      g.ellipse(0, -h, rx * 0.88, ry * 0.88, 0, 0, Math.PI * 2);
      g.stroke();
    }
    if (o.holeR) {
      ellipse(g, 0, -h, rx * o.holeR, ry * o.holeR, o.holeColor || '#0F172A');
    }
    g.restore();
  }

  // Draws animated electron / signal pulses along an array of isometric points
  function drawIsoTraces(g, traces, z, t, o = {}) {
    const traceCol = o.traceColor || 'rgba(56, 189, 248, 0.38)';
    const pulseCol = o.pulseColor || '#38BDF8';
    const active = o.internalFlow !== false;

    traces.forEach((pts, idx) => {
      const screenPts = pts.map(([ix, iy]) => isoPt(ix, iy, z));
      seg(g, screenPts, o.width || 2.5, traceCol);

      if (active && screenPts.length >= 2) {
        const u = (t * (1.2 + (idx % 3) * 0.35) + idx * 0.27) % 1;
        const segIdx = Math.min(screenPts.length - 2, Math.floor(u * (screenPts.length - 1)));
        const localU = u * (screenPts.length - 1) - segIdx;
        const px = lerp(screenPts[segIdx][0], screenPts[segIdx + 1][0], localU);
        const py = lerp(screenPts[segIdx][1], screenPts[segIdx + 1][1], localU);
        glow(g, px, py, 16, pulseCol, 0.85);
        circle(g, px, py, 3.8, '#FFFFFF');
      }
    });
  }

  // ---------- 2. 9:16 Safe-Zone Orthogonal Technical Callout (UI.techCallout) ----------
  // Strictly clamps spec cards inside x: 105..865, y: 320..1400 so they are NEVER
  // clipped on the left or covered by the right-side YouTube Shorts UI icons (x > 880).
  function techCallout(g, t = 1, o = {}) {
    const t0 = o.t0 !== undefined ? o.t0 : 0.1;
    const u = ease.outBack(clamp((t - t0) / (o.dur || 0.45), 0, 1));
    if (u <= 0.001) return;

    const [tx, ty] = o.target || [SAFE.cx, SAFE.cy];
    const reqX = o.x !== undefined ? o.x : tx + 160;
    const reqY = o.y !== undefined ? o.y : ty - 75;
    const accent = o.accent || '#38BDF8';
    const title = String(o.title || o.label || 'COMPONENT');
    const metric = String(o.metric || o.value || '');
    const sub = String(o.subText || o.tag || '');

    // Compute compact 9:16 spec card dimensions
    const titleW = measure(g, title, 16.5, FONTS.ui, 900);
    const metricW = metric ? measure(g, metric, 19.5, FONTS.mono, 700) : 0;
    const subW = sub ? measure(g, sub, 12.5, FONTS.ui, 700) : 0;
    const rawCardW = Math.max(o.w || 215, titleW + 32, metricW + 32, subW + 32);
    const cardW = clamp(rawCardW, 195, 310);
    const cardH = sub ? 84 : metric ? 66 : 46;

    // Determine side relative to target & clamp strictly inside 9:16 Safe Zone (x: 105..865, y: 320..1400)
    const SAFE_LEFT = 105;
    const SAFE_RIGHT = 865;
    const SAFE_TOP = 320;
    const SAFE_BOT = 1400;

    const dirX = reqX >= tx ? 1 : -1;
    const unclampedCardX = dirX > 0 ? reqX : reqX - cardW;
    const cardX = clamp(unclampedCardX, SAFE_LEFT, SAFE_RIGHT - cardW);
    const cardY = clamp(reqY - cardH * 0.5, SAFE_TOP, SAFE_BOT - cardH);
    const cardCenterY = cardY + cardH * 0.5;

    // Leader line anchor point on the card edge closest to target
    const cardCenterX = cardX + cardW * 0.5;
    const attachRightSideOfTarget = cardCenterX >= tx;
    const anchorX = attachRightSideOfTarget ? cardX : cardX + cardW;
    const anchorY = cardCenterY;

    // Compute 45-degree / orthogonal elbow joint between (tx, ty) and (anchorX, anchorY)
    const spanX = anchorX - tx;
    const elbowDir = spanX >= 0 ? 1 : -1;
    const elbowX = tx + elbowDir * Math.min(48, Math.abs(spanX) * 0.42);
    const elbowY = anchorY;

    g.save();
    g.globalAlpha *= clamp(u, 0, 1);

    // 1. Pulsing Target Reticle on Component
    const pulse = 1 + 0.22 * Math.sin(t * 6);
    glow(g, tx, ty, 22 * pulse, accent, 0.65);
    ring(g, tx, ty, 9 * pulse, 2.2, accent);
    circle(g, tx, ty, 4.2, '#FFFFFF');

    // 2. Orthogonal 2-Segment Leader Line + Travelling Telemetry Dot
    const lineProg = clamp((t - t0) / 0.32, 0, 1);
    const curElbowX = lerp(tx, elbowX, clamp(lineProg * 2, 0, 1));
    const curElbowY = lerp(ty, elbowY, clamp(lineProg * 2, 0, 1));
    const curEndX = lineProg > 0.5 ? lerp(elbowX, anchorX, (lineProg - 0.5) * 2) : curElbowX;
    const curEndY = lineProg > 0.5 ? lerp(elbowY, anchorY, (lineProg - 0.5) * 2) : curElbowY;

    seg(
      g,
      [
        [tx, ty],
        [curElbowX, curElbowY],
        [curEndX, curEndY],
      ],
      2.4,
      accent
    );
    circle(g, elbowX, elbowY, 3.2, accent);

    const sigU = (t * 1.4) % 1;
    const sx = sigU < 0.4 ? lerp(tx, elbowX, sigU / 0.4) : lerp(elbowX, anchorX, (sigU - 0.4) / 0.6);
    const sy = sigU < 0.4 ? lerp(ty, elbowY, sigU / 0.4) : elbowY;
    circle(g, sx, sy, 3.2, '#FFFFFF');

    // 3. 9:16 Safe-Zone Hardcore-Info Spec Card
    g.save();
    g.translate(anchorX, anchorY);
    g.scale(u, u);
    g.translate(-anchorX, -anchorY);

    // Card backdrop + glowing accent edge bar
    rr(g, cardX, cardY, cardW, cardH, 10);
    g.fillStyle = 'rgba(13, 20, 38, 0.94)';
    g.fill();
    g.strokeStyle = alpha(accent, 0.68);
    g.lineWidth = 2;
    g.stroke();

    const barOnLeft = attachRightSideOfTarget;
    rr(g, barOnLeft ? cardX : cardX + cardW - 6, cardY, 6, cardH, 3);
    g.fillStyle = accent;
    g.fill();

    const padX = cardX + 14;
    text(g, title, padX, cardY + 19, {
      size: 16.5,
      font: FONTS.ui,
      weight: 900,
      color: '#F8FAFC',
      align: 'left',
      spacing: 0.6,
    });

    if (metric) {
      text(g, metric, padX, cardY + 44, {
        size: 19.5,
        font: FONTS.mono,
        weight: 700,
        color: accent,
        align: 'left',
      });
    }

    if (sub) {
      text(g, sub, padX, cardY + 67, {
        size: 12.5,
        font: FONTS.ui,
        weight: 700,
        color: '#94A3B8',
        align: 'left',
        spacing: 0.8,
      });
    }

    if (o.barProg !== undefined) {
      const bw = cardW - 28;
      const bx = padX;
      const by = cardY + cardH - 9;
      rr(g, bx, by, bw, 4.5, 2.2);
      g.fillStyle = 'rgba(148, 163, 184, 0.22)';
      g.fill();
      rr(g, bx, by, bw * clamp(o.barProg * u, 0, 1), 4.5, 2.2);
      g.fillStyle = accent;
      g.fill();
    }

    g.restore();
    g.restore();
  }

  // ---------- 3. Built-In Hardware Layer Definitions (7 Devices Calibrated for 9:16) ----------
  // Every calloutOffset is calibrated around (cx = 500, cy = 920) so left & right
  // spec cards sit cleanly inside x: 105..865, y: 320..1400 with zero overlap.
  function getDeviceLayers(device, opts = {}) {
    const dev = String(device || opts.kind || 'smartphone').toLowerCase();

    // ==================== 1. SMARTPHONE / IPHONE (6 LAYERS) ====================
    if (dev === 'smartphone' || dev === 'iphone' || dev === 'phone') {
      return [
        {
          id: 'chassis',
          name: 'GRADE 5 TITANIUM FRAME',
          metric: 'Ti-6Al-4V · 1.2mm CNC',
          tag: 'STRUCTURAL CHASSIS',
          accent: '#94A3B8',
          calloutOffset: [-155, 65],
          draw: (g, t) => {
            isoSlab(g, 236, 130, 16, { color: '#475569', rimColor: '#CBD5E1' });
            isoSlab(g, 218, 114, 17, { color: '#1E293B', rimWidth: 0 });
            // MagSafe wireless charging coil ring
            isoDisc(g, 0, 0, 18, 36, 21, 2, {
              color: '#334155',
              ringColor: '#F59E0B',
              ringWidth: 3,
              holeR: 0.65,
            });
          },
        },
        {
          id: 'battery',
          name: 'L-SHAPED LI-ION BATTERY',
          metric: '4,685 mAh · 18.1 Wh',
          tag: 'ENERGY STORAGE CELL',
          accent: '#38C878',
          calloutOffset: [120, 55],
          draw: (g, t, flow) => {
            g.save();
            const [ox, oy] = isoPt(16, 10, 0);
            g.translate(ox, oy);
            isoSlab(g, 138, 74, 14, { color: '#1E293B', topColor: '#0F172A', rimColor: '#38C878' });
            if (flow) {
              const chargeW = 86 * (0.35 + 0.65 * ((t * 0.45) % 1));
              isoSlab(g, chargeW, 50, 15, { color: '#10B981', topColor: '#34D399', rimWidth: 0 });
            }
            text(g, 'Li-Ion 18.1Wh', 0, -16, {
              size: 12,
              font: FONTS.mono,
              color: '#38C878',
              weight: 700,
            });
            g.restore();
          },
        },
        {
          id: 'pcb',
          name: '3NM A18 PRO / SOC DIE',
          metric: '19B Transistors · NPU',
          tag: 'STACKED LOGIC PCB',
          accent: '#38BDF8',
          calloutOffset: [-155, -10],
          draw: (g, t, flow) => {
            const [ox, oy] = isoPt(-38, -14, 0);
            g.save();
            g.translate(ox, oy);
            isoSlab(g, 112, 88, 10, { color: '#064E3B', topColor: '#047857', rimColor: '#10B981' });
            // 3nm SoC Silicon Die in center of PCB
            isoSlab(g, 46, 40, 14, { color: '#1E293B', topColor: '#090D16', rimColor: '#38BDF8' });
            glow(g, 0, -14, 34, '#38BDF8', 0.55);
            text(g, '3nm SoC', 0, -15, {
              size: 11,
              font: FONTS.mono,
              color: '#38BDF8',
              weight: 700,
            });
            drawIsoTraces(
              g,
              [
                [
                  [-48, -30],
                  [-16, -10],
                ],
                [
                  [48, -26],
                  [16, -10],
                ],
                [
                  [-44, 26],
                  [-14, 10],
                ],
                [
                  [44, 28],
                  [14, 10],
                ],
              ],
              12,
              t,
              { internalFlow: flow, pulseColor: '#38BDF8' }
            );
            g.restore();
          },
        },
        {
          id: 'camera',
          name: '48MP TETRAPRISM CAMERA',
          metric: '5x Optical · Shift OIS',
          tag: 'OPTICAL SENSOR ARRAY',
          accent: '#F59E0B',
          calloutOffset: [120, -15],
          draw: (g) => {
            const [ox, oy] = isoPt(-62, -26, 0);
            g.save();
            g.translate(ox, oy);
            isoSlab(g, 72, 72, 16, { color: '#334155', rimColor: '#94A3B8' });
            [
              [-17, -17],
              [17, -13],
              [-13, 17],
            ].forEach(([lx, ly]) => {
              isoDisc(g, lx, ly, 16, 14, 8.5, 10, {
                color: '#1E293B',
                ringColor: '#38BDF8',
                holeR: 0.45,
                holeColor: '#0284C7',
              });
            });
            g.restore();
          },
        },
        {
          id: 'thermal',
          name: 'GRAPHENE VAPOR CHAMBER',
          metric: '420 W/m·K Dissipation',
          tag: 'THERMAL SHIELD',
          accent: '#F97316',
          calloutOffset: [-155, -75],
          draw: (g, t, flow) => {
            const heatCol = flow
              ? mix('#D97706', '#EF4444', 0.5 + 0.5 * Math.sin(t * 3.5))
              : '#D97706';
            isoSlab(g, 184, 100, 6, { color: '#B45309', topColor: heatCol, rimColor: '#FBBF24' });
            if (flow) glow(g, 0, -6, 80, '#F97316', 0.42);
          },
        },
        {
          id: 'display',
          name: 'LTPO SUPER RETINA OLED',
          metric: '2,000 Nits · 120Hz XDR',
          tag: 'CERAMIC SHIELD GLASS',
          accent: '#A855F7',
          calloutOffset: [120, -85],
          draw: (g) => {
            isoSlab(g, 232, 126, 9, {
              color: '#0F172A',
              topColor: '#1E1B4B',
              rimColor: '#38BDF8',
              glass: true,
            });
            const [dx, dy] = isoPt(-86, 0, 10);
            ellipse(g, dx, dy, 8.5, 17, '#05070D', -0.52);
          },
        },
      ];
    }

    // ==================== 2. HEADPHONES / EARBUDS (6 LAYERS) ====================
    if (dev === 'headphones' || dev === 'earbuds' || dev === 'airpods') {
      return [
        {
          id: 'shell',
          name: 'ANODIZED ACOUSTIC CUP',
          metric: 'CNC Aluminum Chamber',
          tag: 'OUTER ENCLOSURE',
          accent: '#94A3B8',
          calloutOffset: [-155, 65],
          draw: (g) => {
            isoDisc(g, 0, 0, 0, 112, 65, 26, { color: '#475569', ringColor: '#CBD5E1' });
          },
        },
        {
          id: 'dsp',
          name: 'H2 ULTRA-LOW LATENCY DSP',
          metric: '48,000x/sec ANC Cancel',
          tag: 'ACTIVE NOISE PCB',
          accent: '#38BDF8',
          calloutOffset: [120, 55],
          draw: (g, t, flow) => {
            isoDisc(g, 0, 0, 0, 88, 52, 10, { color: '#065F46', ringColor: '#10B981' });
            isoSlab(g, 40, 40, 14, { color: '#0F172A', rimColor: '#38BDF8' });
            drawIsoTraces(
              g,
              [
                [
                  [-42, 0],
                  [42, 0],
                ],
                [
                  [0, -42],
                  [0, 42],
                ],
              ],
              12,
              t,
              { internalFlow: flow }
            );
          },
        },
        {
          id: 'battery',
          name: 'TOROIDAL LI-PO BATTERY',
          metric: '30-Hour ANC Playback',
          tag: 'RING POWER CELL',
          accent: '#38C878',
          calloutOffset: [-155, -10],
          draw: (g) => {
            isoDisc(g, 0, 0, 0, 82, 48, 14, {
              color: '#1E293B',
              ringColor: '#38C878',
              holeR: 0.55,
            });
          },
        },
        {
          id: 'magnet',
          name: 'N52 NEODYMIUM MAGNET',
          metric: '1.4 Tesla Flux Gap',
          tag: 'MAGNETIC MOTOR RING',
          accent: '#F59E0B',
          calloutOffset: [120, -15],
          draw: (g) => {
            isoDisc(g, 0, 0, 0, 72, 42, 18, {
              color: '#CBD5E1',
              ringColor: '#F59E0B',
              holeR: 0.42,
            });
          },
        },
        {
          id: 'driver',
          name: '40MM BERYLLIUM DRIVER',
          metric: '20Hz–40kHz <0.1% THD',
          tag: 'VOICE COIL & DOME',
          accent: '#F43F5E',
          calloutOffset: [-155, -75],
          draw: (g, t, flow) => {
            const vib = flow ? Math.sin(t * 28) * 4 : 0;
            isoDisc(g, 0, 0, vib, 46, 26, 16, { color: '#D97706', ringColor: '#FBBF24' });
            isoDisc(g, 0, 0, 16 + vib, 92, 54, 8, { color: '#94A3B8', ringColor: '#F43F5E' });
            if (flow) {
              for (let w = 0; w < 3; w++) {
                const wu = (t * 1.6 + w * 0.33) % 1;
                g.strokeStyle = alpha('#F43F5E', (1 - wu) * 0.75);
                g.lineWidth = 3;
                g.beginPath();
                g.ellipse(0, -24 - wu * 52, 42 + wu * 60, 24 + wu * 35, 0, 0, Math.PI * 2);
                g.stroke();
              }
            }
          },
        },
        {
          id: 'cushion',
          name: 'MEMORY-FOAM EAR CUSHION',
          metric: 'Passive Acoustic Seal',
          tag: 'EARPAD & BAFFLE',
          accent: '#A855F7',
          calloutOffset: [120, -85],
          draw: (g) => {
            isoDisc(g, 0, 0, 0, 116, 67, 22, {
              color: '#334155',
              ringColor: '#94A3B8',
              holeR: 0.52,
              holeColor: '#1E293B',
            });
          },
        },
      ];
    }

    // ==================== 3. GRAPHICS CARD / GPU (5 LAYERS) ====================
    if (dev === 'gpu' || dev === 'graphicscard') {
      return [
        {
          id: 'backplate',
          name: 'ALUMINUM GPU BACKPLATE',
          metric: 'Flow-Through Exhaust',
          tag: 'STRUCTURAL ARMOR',
          accent: '#94A3B8',
          calloutOffset: [-155, 65],
          draw: (g) => {
            isoSlab(g, 268, 136, 10, { color: '#334155', rimColor: '#94A3B8' });
            isoSlab(g, 88, 88, 11, { color: '#0F172A', rimWidth: 0 });
          },
        },
        {
          id: 'pcb',
          name: '14-LAYER PCIE 5.0 PCB',
          metric: '24-Phase VRM · 600W',
          tag: 'POWER & SIGNAL BOARD',
          accent: '#10B981',
          calloutOffset: [120, 50],
          draw: (g, t, flow) => {
            isoSlab(g, 226, 126, 10, { color: '#0F172A', topColor: '#111827', rimColor: '#10B981' });
            for (let i = -3; i <= 3; i++) {
              const [vx, vy] = isoPt(-82, i * 15, 10);
              g.save();
              g.translate(vx, vy);
              isoSlab(g, 16, 11, 10, { color: '#475569' });
              g.restore();
            }
            drawIsoTraces(
              g,
              [
                [
                  [-84, 0],
                  [0, 0],
                ],
                [
                  [0, -46],
                  [0, 46],
                ],
                [
                  [78, -28],
                  [14, -10],
                ],
              ],
              11,
              t,
              { internalFlow: flow, pulseColor: '#10B981' }
            );
          },
        },
        {
          id: 'die',
          name: '4NM GPU DIE + GDDR7 VRAM',
          metric: '76B Transistors · 1.8TB/s',
          tag: 'SILICON COMPUTE CORE',
          accent: '#38BDF8',
          calloutOffset: [-155, -15],
          draw: (g, t, flow) => {
            isoSlab(g, 70, 70, 12, {
              color: '#0284C7',
              topColor: '#0369A1',
              rimColor: '#38BDF8',
              glass: true,
            });
            if (flow) glow(g, 0, -12, 62, '#38BDF8', 0.65);
            const vramPos = [
              [-58, -24],
              [-58, 24],
              [58, -24],
              [58, 24],
              [-24, -58],
              [24, -58],
              [-24, 58],
              [24, 58],
            ];
            vramPos.forEach(([vx, vy]) => {
              const [sx, sy] = isoPt(vx, vy, 0);
              g.save();
              g.translate(sx, sy);
              isoSlab(g, 22, 22, 9, { color: '#1E293B', rimColor: '#64748B' });
              g.restore();
            });
          },
        },
        {
          id: 'heatsink',
          name: 'VAPOR CHAMBER FIN STACK',
          metric: '8x Copper Heatpipes',
          tag: 'THERMAL DISSIPATION',
          accent: '#F97316',
          calloutOffset: [120, -35],
          draw: (g, t, flow) => {
            [-34, -11, 11, 34].forEach((py) => {
              const p0 = isoPt(-126, py, 4);
              const p1 = isoPt(126, py, 4);
              seg(g, [p0, p1], 7.5, flow ? '#F97316' : '#D97706');
            });
            isoSlab(g, 264, 130, 22, { color: '#94A3B8', topColor: '#CBD5E1', rimColor: '#E2E8F0' });
            if (flow) glow(g, 0, -14, 90, '#F97316', 0.42);
          },
        },
        {
          id: 'shroud',
          name: 'TRIPLE AXIAL FAN SHROUD',
          metric: 'Counter-Rotating Airflow',
          tag: 'ACTIVE COOLING DECK',
          accent: '#A855F7',
          calloutOffset: [-155, -85],
          draw: (g, t, flow) => {
            isoSlab(g, 274, 138, 18, { color: '#1E293B', topColor: '#0F172A', rimColor: '#38BDF8' });
            [-86, 0, 86].forEach((fx, idx) => {
              isoDisc(g, fx, 0, 18, 39, 22, 4, { color: '#334155', ringColor: '#38BDF8' });
              const [cx, cy] = isoPt(fx, 0, 22);
              const spin = flow ? t * 14 * (idx === 1 ? -1 : 1) : 0;
              for (let b = 0; b < 7; b++) {
                const ang = spin + (b / 7) * Math.PI * 2;
                seg(g, [[cx, cy], [cx + Math.cos(ang) * 32, cy + Math.sin(ang) * 18]], 4.2, '#64748B');
              }
              circle(g, cx, cy, 8.5, '#0F172A');
            });
          },
        },
      ];
    }

    // ==================== 4. LAPTOP (5 LAYERS) ====================
    if (dev === 'laptop' || dev === 'macbook') {
      return [
        {
          id: 'base',
          name: 'CNC ALUMINUM UNIBODY',
          metric: 'Acoustic Side Vents',
          tag: 'BOTTOM ENCLOSURE',
          accent: '#94A3B8',
          calloutOffset: [-155, 65],
          draw: (g) =>
            isoSlab(g, 280, 190, 12, { color: '#64748B', topColor: '#94A3B8', rimColor: '#E2E8F0' }),
        },
        {
          id: 'battery',
          name: '100WH 6-CELL LI-PO PACK',
          metric: '22-Hour Battery Life',
          tag: 'POWER SUBSYSTEM',
          accent: '#38C878',
          calloutOffset: [120, 50],
          draw: (g) => {
            const [ox, oy] = isoPt(0, 38, 0);
            g.save();
            g.translate(ox, oy);
            isoSlab(g, 250, 78, 12, { color: '#1E293B', topColor: '#0F172A', rimColor: '#38C878' });
            g.restore();
          },
        },
        {
          id: 'logic',
          name: 'UNIFIED SOC & BLOWERS',
          metric: '128GB RAM · 400GB/s',
          tag: 'MAIN LOGIC BOARD',
          accent: '#38BDF8',
          calloutOffset: [-155, -15],
          draw: (g, t, flow) => {
            const [ox, oy] = isoPt(0, -34, 0);
            g.save();
            g.translate(ox, oy);
            isoSlab(g, 220, 82, 10, { color: '#0F172A', rimColor: '#38BDF8' });
            isoSlab(g, 48, 48, 14, { color: '#0284C7', rimColor: '#BAE6FD' });
            isoDisc(g, -84, 0, 10, 31, 18, 6, { color: '#334155', ringColor: '#94A3B8' });
            isoDisc(g, 84, 0, 10, 31, 18, 6, { color: '#334155', ringColor: '#94A3B8' });
            if (flow) glow(g, 0, -14, 52, '#38BDF8', 0.55);
            g.restore();
          },
        },
        {
          id: 'keyboard',
          name: 'SCISSOR KEYBOARD DECK',
          metric: 'Force Touch Trackpad',
          tag: 'TOP CASE INPUT',
          accent: '#F59E0B',
          calloutOffset: [120, -35],
          draw: (g) => {
            isoSlab(g, 280, 190, 10, { color: '#94A3B8', topColor: '#CBD5E1', rimColor: '#F8FAFC' });
            const [kx, ky] = isoPt(0, -25, 11);
            g.save();
            g.translate(kx, ky);
            isoSlab(g, 232, 84, 3, { color: '#1E293B', topColor: '#0F172A' });
            g.restore();
            const [tx, ty] = isoPt(0, 52, 11);
            g.save();
            g.translate(tx, ty);
            isoSlab(g, 96, 58, 2, { color: '#94A3B8', topColor: '#BAC8D9' });
            g.restore();
          },
        },
        {
          id: 'display',
          name: 'MINI-LED XDR DISPLAY',
          metric: '10,000 Local Dim Zones',
          tag: 'DISPLAY ASSEMBLY',
          accent: '#A855F7',
          calloutOffset: [-155, -85],
          draw: (g) =>
            isoSlab(g, 280, 190, 8, {
              color: '#0F172A',
              topColor: '#1E1B4B',
              rimColor: '#38BDF8',
              glass: true,
            }),
        },
      ];
    }

    // ==================== 5. CPU / SILICON SOC PACKAGE (5 LAYERS) ====================
    if (dev === 'cpu' || dev === 'soc' || dev === 'processor') {
      return [
        {
          id: 'socket',
          name: 'LGA 1851 / AM5 SOCKET',
          metric: '1,851 Gold Contact Pins',
          tag: 'MOTHERBOARD SOCKET',
          accent: '#F59E0B',
          calloutOffset: [-155, 65],
          draw: (g) =>
            isoSlab(g, 200, 200, 14, { color: '#1E293B', topColor: '#B45309', rimColor: '#F59E0B' }),
        },
        {
          id: 'substrate',
          name: '12-LAYER ABF SUBSTRATE',
          metric: 'Sub-Micron PCIe Routing',
          tag: 'PACKAGE SUBSTRATE',
          accent: '#10B981',
          calloutOffset: [120, 50],
          draw: (g, t, flow) => {
            isoSlab(g, 180, 180, 10, { color: '#064E3B', topColor: '#047857', rimColor: '#34D399' });
            drawIsoTraces(
              g,
              [
                [
                  [-70, -70],
                  [70, 70],
                ],
                [
                  [-70, 70],
                  [70, -70],
                ],
                [
                  [-75, 0],
                  [75, 0],
                ],
              ],
              11,
              t,
              { internalFlow: flow, pulseColor: '#34D399' }
            );
          },
        },
        {
          id: 'chiplets',
          name: '3NM CHIPLETS + 3D V-CACHE',
          metric: '16 Cores · 144MB L3 Cache',
          tag: 'SILICON DIE COMPLEX',
          accent: '#38BDF8',
          calloutOffset: [-155, -15],
          draw: (g, t, flow) => {
            isoSlab(g, 78, 92, 12, {
              color: '#0284C7',
              topColor: '#0369A1',
              rimColor: '#38BDF8',
              glass: true,
            });
            [-54, 54].forEach((cx) => {
              const [sx, sy] = isoPt(cx, 0, 0);
              g.save();
              g.translate(sx, sy);
              isoSlab(g, 36, 64, 14, {
                color: '#312E81',
                topColor: '#4338CA',
                rimColor: '#A855F7',
                glass: true,
              });
              g.restore();
            });
            if (flow) glow(g, 0, -14, 70, '#38BDF8', 0.6);
          },
        },
        {
          id: 'stim',
          name: 'INDIUM SOLDER TIM LAYER',
          metric: '86 W/m·K Heat Transfer',
          tag: 'THERMAL BOND (STIM)',
          accent: '#F97316',
          calloutOffset: [120, -35],
          draw: (g, t, flow) => {
            isoSlab(g, 128, 104, 6, {
              color: '#D97706',
              topColor: flow ? '#F97316' : '#F59E0B',
              rimColor: '#FDE68A',
            });
          },
        },
        {
          id: 'ihs',
          name: 'NICKEL-COPPER HEAT SPREADER',
          metric: 'Precision-Lapped IHS Lid',
          tag: 'INTEGRATED HEAT SPREADER',
          accent: '#CBD5E1',
          calloutOffset: [-155, -85],
          draw: (g) => {
            isoSlab(g, 166, 166, 16, { color: '#64748B', topColor: '#CBD5E1', rimColor: '#F8FAFC' });
            isoSlab(g, 130, 130, 22, { color: '#94A3B8', topColor: '#E2E8F0', rimColor: '#FFFFFF' });
            text(g, 'LUMINA PRO X', 0, -24, {
              size: 12.5,
              font: FONTS.mono,
              color: '#334155',
              weight: 700,
            });
          },
        },
      ];
    }

    // ==================== 6. JET ENGINE / TURBOFAN (5 STAGES) ====================
    if (dev === 'jetengine' || dev === 'turbofan' || dev === 'turbine') {
      return [
        {
          id: 'fan',
          name: 'TITANIUM INTAKE FAN',
          metric: '10:1 Bypass · 2,400 RPM',
          tag: 'STAGE 1 · COLD INTAKE',
          accent: '#38BDF8',
          calloutOffset: [-155, 65],
          draw: (g, t, flow) => {
            isoDisc(g, 0, 0, 0, 110, 65, 24, { color: '#334155', ringColor: '#38BDF8' });
            const spin = flow ? t * 12 : 0;
            for (let b = 0; b < 14; b++) {
              const ang = spin + (b / 14) * Math.PI * 2;
              seg(g, [[0, -12], [Math.cos(ang) * 94, -12 + Math.sin(ang) * 54]], 5.5, '#CBD5E1');
            }
            circle(g, 0, -12, 21, sphereGrad(g, 0, -12, 21, '#0F172A'));
          },
        },
        {
          id: 'compressor',
          name: '14-STAGE HP COMPRESSOR',
          metric: '50:1 Pressure Ratio',
          tag: 'STAGE 2 · COMPRESSION',
          accent: '#60A5FA',
          calloutOffset: [120, 50],
          draw: (g) => {
            isoDisc(g, 0, 0, 0, 84, 50, 22, { color: '#475569', ringColor: '#93C5FD' });
            isoDisc(g, 0, 0, 18, 72, 43, 16, { color: '#64748B', ringColor: '#BAE6FD' });
          },
        },
        {
          id: 'combustor',
          name: 'ANNULAR SWIRL COMBUSTOR',
          metric: '2,100°C Jet-A1 Ignition',
          tag: 'STAGE 3 · COMBUSTION',
          accent: '#F97316',
          calloutOffset: [-155, -15],
          draw: (g, t, flow) => {
            isoDisc(g, 0, 0, 0, 78, 46, 26, {
              color: '#7C2D12',
              ringColor: '#F97316',
              holeR: 0.48,
              holeColor: '#431407',
            });
            if (flow) {
              glow(g, 0, -14, 110, '#F97316', 0.85);
              for (let f = 0; f < 8; f++) {
                const ang = t * 5 + (f / 8) * Math.PI * 2;
                circle(g, Math.cos(ang) * 53, -14 + Math.sin(ang) * 30, 8.5, '#FEF08A');
              }
            }
          },
        },
        {
          id: 'turbine',
          name: 'SINGLE-CRYSTAL TURBINE',
          metric: 'Film-Cooled Superalloy',
          tag: 'STAGE 4 · EXTRACTION',
          accent: '#F43F5E',
          calloutOffset: [120, -35],
          draw: (g) => {
            isoDisc(g, 0, 0, 0, 88, 52, 22, { color: '#881337', ringColor: '#FB7185' });
          },
        },
        {
          id: 'nozzle',
          name: 'CHEVRON EXHAUST NOZZLE',
          metric: '120,000 lbf Mach 1.8',
          tag: 'STAGE 5 · PROPULSION',
          accent: '#A855F7',
          calloutOffset: [-155, -85],
          draw: (g, t, flow) => {
            isoDisc(g, 0, 0, 0, 70, 42, 30, { color: '#1E293B', ringColor: '#A855F7' });
            if (flow) glow(g, 0, 20, 90, '#38BDF8', 0.65);
          },
        },
      ];
    }

    // ==================== 7. EV / LITHIUM BATTERY PACK (5 LAYERS) ====================
    return [
      {
        id: 'tray',
        name: 'BALLISTIC TITANIUM TRAY',
        metric: 'Underbody Impact Shield',
        tag: 'STRUCTURAL FLOOR TRAY',
        accent: '#94A3B8',
        calloutOffset: [-155, 65],
        draw: (g) => isoSlab(g, 280, 170, 14, { color: '#334155', rimColor: '#94A3B8' }),
      },
      {
        id: 'cooling',
        name: 'GLYCOL COOLING RIBBON',
        metric: 'Active Thermal Loop',
        tag: 'LIQUID COOLING PLATE',
        accent: '#38BDF8',
        calloutOffset: [120, 50],
        draw: (g, t, flow) => {
          isoSlab(g, 264, 152, 8, { color: '#0369A1', topColor: '#0284C7', rimColor: '#38BDF8' });
          drawIsoTraces(
            g,
            [
              [
                [-110, -50],
                [110, -50],
                [110, 0],
                [-110, 0],
                [-110, 50],
                [110, 50],
              ],
            ],
            9,
            t,
            { internalFlow: flow, pulseColor: '#BAE6FD' }
          );
        },
      },
      {
        id: 'cells',
        name: '4680 TABLESS CELL ARRAY',
        metric: '300 Wh/kg Silicon Anode',
        tag: 'ELECTROCHEMICAL CORE',
        accent: '#38C878',
        calloutOffset: [-155, -15],
        draw: (g, t, flow) => {
          for (let ix = -96; ix <= 96; ix += 38) {
            for (let iy = -48; iy <= 48; iy += 32) {
              isoDisc(g, ix, iy, 0, 14, 8.5, 24, { color: '#059669', ringColor: '#6EE7B7' });
            }
          }
          if (flow) glow(g, 0, -18, 90, '#38C878', 0.45);
        },
      },
      {
        id: 'busbar',
        name: '800V LASER COPPER BUSBAR',
        metric: '350kW Ultra-Fast DC Path',
        tag: 'HIGH-VOLTAGE BUS',
        accent: '#F59E0B',
        calloutOffset: [120, -35],
        draw: (g) =>
          isoSlab(g, 260, 148, 6, { color: '#B45309', topColor: '#F59E0B', rimColor: '#FDE68A' }),
      },
      {
        id: 'bms',
        name: 'AI BATTERY BMS & PYRO-FUSE',
        metric: 'Real-Time Cell Balancing',
        tag: 'FIREPROOF TOP COVER',
        accent: '#A855F7',
        calloutOffset: [-155, -85],
        draw: (g) =>
          isoSlab(g, 280, 170, 10, { color: '#1E293B', topColor: '#0F172A', rimColor: '#A855F7' }),
      },
    ];
  }

  // ---------- 4. Universal Exploded Assembly & Hardware Teardown Renderer ----------
  // Calibrated to 9:16 Safe Center (x = 500, y = 920) & vertical spacing = 105.
  // Supports both o.focusLayer and o.isolateLayer, and both o.device and o.kind.
  function explodedAssembly(g, t = 0, o = {}) {
    const x = o.x !== undefined ? o.x : SAFE.cx; // 500
    const y = o.y !== undefined ? o.y : SAFE.cy; // 920
    const s = o.s !== undefined ? o.s : 0.94;
    const explode = clamp(o.explode !== undefined ? o.explode : 0.88, 0, 1.5);
    const spacing = (o.spacing !== undefined ? o.spacing : 105) * explode;
    const axis = o.axis || 'y'; // 'y' (vertical stack) | 'x' (horizontal axial)
    const layers = Array.isArray(o.layers) ? o.layers : [];
    const rawFocus =
      o.focusLayer !== undefined && o.focusLayer !== null
        ? o.focusLayer
        : o.isolateLayer !== undefined && o.isolateLayer !== null
        ? o.isolateLayer
        : null;
    const focusLayer = rawFocus;
    const internalFlow = o.internalFlow !== false;
    const showGuidelines = o.guidelines !== false && explode > 0.08;
    const showCallouts = o.showCallouts !== false && explode > 0.25;

    if (!layers.length) return;

    const midIdx = (layers.length - 1) * 0.5;
    const layerCoords = [];

    g.save();

    // 1. Optional Central Dashed Isometric Alignment Axis Spine
    if (showGuidelines) {
      const p0 = axis === 'x' ? [x - midIdx * spacing * s, y] : [x, y + midIdx * spacing * s];
      const p1 = axis === 'x' ? [x + midIdx * spacing * s, y] : [x, y - midIdx * spacing * s];
      g.save();
      g.strokeStyle = 'rgba(56, 189, 248, 0.34)';
      g.lineWidth = 2;
      g.setLineDash([8, 8]);
      g.beginPath();
      g.moveTo(p0[0], p0[1]);
      g.lineTo(p1[0], p1[1]);
      g.stroke();
      g.restore();
    }

    // 2. Render Layers Bottom-to-Top with Spotlight Isolation Support
    layers.forEach((lyr, idx) => {
      const offset = (idx - midIdx) * spacing * s;
      const lx = axis === 'x' ? x + offset : x;
      const ly = axis === 'x' ? y : y - offset;
      layerCoords.push({ lx, ly, lyr, idx });

      const isFocused =
        focusLayer === null ||
        focusLayer === idx ||
        focusLayer === lyr.id ||
        focusLayer === lyr.name;

      const layerAlpha = focusLayer === null ? 1.0 : isFocused ? 1.0 : 0.18;
      const layerScale = focusLayer !== null && isFocused ? s * 1.1 : s;

      g.save();
      g.globalAlpha *= layerAlpha;
      g.translate(lx, ly);
      g.scale(layerScale, layerScale);

      if (focusLayer !== null && isFocused) {
        glow(g, 0, -10, 145, lyr.accent || '#38BDF8', 0.48);
      }

      if (typeof lyr.draw === 'function') {
        lyr.draw(g, t, internalFlow && isFocused, idx);
      } else {
        isoSlab(g, lyr.w || 210, lyr.d || 130, lyr.h || 14, lyr);
      }

      g.restore();
    });

    // 3. Render 9:16 Safe-Zone Orthogonal Leader-Line Callouts
    if (showCallouts) {
      layerCoords.forEach(({ lx, ly, lyr, idx }) => {
        const isFocused =
          focusLayer === null ||
          focusLayer === idx ||
          focusLayer === lyr.id ||
          focusLayer === lyr.name;

        if (focusLayer !== null && !isFocused) return;
        if (lyr.hideCallout) return;

        const [ox, oy] = lyr.calloutOffset || [idx % 2 === 0 ? -155 : 120, 0];
        techCallout(g, t, {
          t0: (o.calloutStart || 0.15) + idx * 0.08,
          target: [lx, ly - 10 * s],
          x: lx + ox * s,
          y: ly + oy * s,
          title: lyr.name,
          metric: lyr.metric,
          subText: lyr.tag,
          accent: lyr.accent || '#38BDF8',
        });
      });
    }

    g.restore();
  }

  function hardwareTeardown(g, t = 0, o = {}) {
    const devKey = o.device || o.kind || 'smartphone';
    const layers = o.layers || getDeviceLayers(devKey, o);
    explodedAssembly(g, t, Object.assign({}, o, { layers }));
  }

  // ---------- 5. 9:16 Generation Upgrade Diff Card (UI.upgradeDiff) ----------
  // Default size w = 720, h = 360 centered at x = 500, y = 920 (strictly inside 100..880).
  // Supports both single-metric (oldVal / newVal) AND multi-row `metrics` array!
  function upgradeDiff(g, t = 0, o = {}) {
    const t0 = o.t0 !== undefined ? o.t0 : 0.1;
    const u = ease.outBack(clamp((t - t0) / 0.5, 0, 1));
    if (u <= 0.001) return;

    const x = o.x !== undefined ? o.x : SAFE.cx; // 500
    const y = o.y !== undefined ? o.y : SAFE.cy; // 920
    const w = clamp(o.w || 720, 480, 760);
    const hasMetricsArray = Array.isArray(o.metrics) && o.metrics.length > 0;
    const rowCount = hasMetricsArray ? o.metrics.length : 1;
    const defaultH = hasMetricsArray ? Math.max(360, 140 + rowCount * 115) : 360;
    const h = o.h || defaultH;

    const title = String(o.title || 'ARCHITECTURE UPGRADE');
    const delta = String(
      o.delta || (hasMetricsArray && o.metrics[0].delta ? o.metrics[0].delta : '+127% SPEED')
    );
    const accent = o.accent || '#38C878';

    g.save();
    g.translate(x, y);
    g.scale(u, u);

    // Main Glassmorphic 9:16 Comparison Panel
    rr(g, -w / 2, -h / 2, w, h, 22);
    g.fillStyle = 'rgba(12, 18, 34, 0.95)';
    g.fill();
    g.strokeStyle = alpha(accent, 0.68);
    g.lineWidth = 3;
    g.stroke();

    // Header Title + Glowing Delta Pill Badge
    const hdrY = -h * 0.5 + 48;
    text(g, title, -w * 0.44, hdrY, {
      size: 22,
      font: FONTS.ui,
      weight: 900,
      color: '#F8FAFC',
      align: 'left',
      spacing: 1.2,
    });

    const dW = measure(g, delta, 18, FONTS.mono, 700) + 34;
    rr(g, w * 0.44 - dW, hdrY - 20, dW, 40, 20);
    g.fillStyle = alpha(accent, 0.18);
    g.fill();
    g.strokeStyle = accent;
    g.lineWidth = 2;
    g.stroke();
    text(g, delta, w * 0.44 - dW * 0.5, hdrY + 1, {
      size: 18,
      font: FONTS.mono,
      weight: 700,
      color: accent,
    });

    // Subtle divider under header
    seg(
      g,
      [
        [-w * 0.44, hdrY + 32],
        [w * 0.44, hdrY + 32],
      ],
      1.5,
      'rgba(148, 163, 184, 0.18)'
    );

    if (hasMetricsArray) {
      // Multi-row metrics mode (e.g., comparing 2-3 specs between Old Gen & New Gen)
      const startY = hdrY + 72;
      const rowStep = (h - 110) / rowCount;

      o.metrics.forEach((m, idx) => {
        const ry = startY + idx * rowStep;
        const mLabel = String(m.label || m.name || 'METRIC ' + (idx + 1));
        const mOld = String(m.oldVal !== undefined ? m.oldVal : m.old || '1.0x');
        const mNew = String(m.newVal !== undefined ? m.newVal : m.new || '2.0x');
        const mDelta = m.delta ? String(m.delta) : '';
        const oldB = clamp(m.oldBar !== undefined ? m.oldBar : 0.45, 0.06, 1);
        const newB = clamp(m.newBar !== undefined ? m.newBar : 0.94, 0.06, 1);
        const rowAcc = m.accent || accent;
        const barU = ease.out(clamp((t - t0 - 0.12 - idx * 0.1) / 0.6, 0, 1));

        // Metric Title & Values
        text(g, mLabel, -w * 0.44, ry, {
          size: 17,
          font: FONTS.ui,
          weight: 900,
          color: '#E2E8F0',
          align: 'left',
        });
        const rightStr = mOld + '  →  ' + mNew + (mDelta ? ' (' + mDelta + ')' : '');
        text(g, rightStr, w * 0.44, ry, {
          size: 17,
          font: FONTS.mono,
          weight: 700,
          color: rowAcc,
          align: 'right',
        });

        // Old bar (top thin slate track)
        const bW = w * 0.88;
        rr(g, -w * 0.44, ry + 16, bW, 12, 6);
        g.fillStyle = 'rgba(148, 163, 184, 0.14)';
        g.fill();
        rr(g, -w * 0.44, ry + 16, bW * oldB * barU, 12, 6);
        g.fillStyle = '#64748B';
        g.fill();

        // New bar (bottom glowing accent track)
        const newFillW = bW * newB * barU;
        rr(g, -w * 0.44, ry + 34, bW, 16, 8);
        g.fillStyle = 'rgba(148, 163, 184, 0.14)';
        g.fill();
        rr(g, -w * 0.44, ry + 34, newFillW, 16, 8);
        g.fillStyle = linGrad(g, -w * 0.44, ry + 34, -w * 0.44 + newFillW, ry + 34, [
          shade(rowAcc, -0.15),
          rowAcc,
          shade(rowAcc, 0.25),
        ]);
        g.fill();
        glow(g, -w * 0.44 + newFillW, ry + 42, 26, rowAcc, 0.55);
      });
    } else {
      // Single-metric High-Impact Comparison Mode
      const oldLabel = String(o.oldLabel || 'PREVIOUS GEN');
      const newLabel = String(o.newLabel || 'NEXT-GEN PRO');
      const oldVal = String(o.oldVal || '5nm · 120 GB/s');
      const newVal = String(o.newVal || '3nm · 273 GB/s');
      const oldBar = clamp(o.oldBar !== undefined ? o.oldBar : 0.44, 0.05, 1);
      const newBar = clamp(o.newBar !== undefined ? o.newBar : 0.94, 0.05, 1);
      const barU = ease.out(clamp((t - t0 - 0.15) / 0.65, 0, 1));

      // Row 1: Previous Generation (Muted Slate)
      const r1Y = -12;
      text(g, oldLabel, -w * 0.44, r1Y - 22, {
        size: 18,
        font: FONTS.ui,
        weight: 800,
        color: '#94A3B8',
        align: 'left',
      });
      text(g, oldVal, w * 0.44, r1Y - 22, {
        size: 21,
        font: FONTS.mono,
        weight: 700,
        color: '#CBD5E1',
        align: 'right',
      });
      rr(g, -w * 0.44, r1Y, w * 0.88, 22, 11);
      g.fillStyle = 'rgba(148, 163, 184, 0.15)';
      g.fill();
      rr(g, -w * 0.44, r1Y, w * 0.88 * oldBar * barU, 22, 11);
      g.fillStyle = '#64748B';
      g.fill();

      // Row 2: New Generation (Glowing Accent Gradient)
      const r2Y = 96;
      text(g, newLabel, -w * 0.44, r2Y - 22, {
        size: 20,
        font: FONTS.ui,
        weight: 900,
        color: '#FFFFFF',
        align: 'left',
      });
      text(g, newVal, w * 0.44, r2Y - 22, {
        size: 25,
        font: FONTS.mono,
        weight: 700,
        color: accent,
        align: 'right',
      });
      rr(g, -w * 0.44, r2Y, w * 0.88, 26, 13);
      g.fillStyle = 'rgba(148, 163, 184, 0.15)';
      g.fill();
      const newW = w * 0.88 * newBar * barU;
      rr(g, -w * 0.44, r2Y, newW, 26, 13);
      g.fillStyle = linGrad(g, -w * 0.44, r2Y, -w * 0.44 + newW, r2Y, [
        shade(accent, -0.15),
        accent,
        shade(accent, 0.25),
      ]);
      g.fill();
      glow(g, -w * 0.44 + newW, r2Y + 13, 38, accent, 0.65);
    }

    g.restore();
  }

  // ---------- 6. Export to Global Namespaces ----------
  const TEARDOWN = (window.TEARDOWN = {
    isoPt,
    isoSlab,
    isoDisc,
    drawIsoTraces,
    getDeviceLayers,
    explodedAssembly,
    hardwareTeardown,
    techCallout,
    upgradeDiff,
  });

  UI.hardwareTeardown = DK.hardwareTeardown = H.hardwareTeardown = hardwareTeardown;
  UI.explodedAssembly = DK.explodedAssembly = H.explodedAssembly = explodedAssembly;
  UI.techCallout = DK.techCallout = H.techCallout = techCallout;
  UI.upgradeDiff = DK.upgradeDiff = H.upgradeDiff = upgradeDiff;
})();