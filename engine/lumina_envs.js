// ============================================================================
// MODULE 7: LUMINA_ENVS (engine/lumina_envs.js) — 9:16 Vertical Shorts Edition
// "The Infographics Show" & Kurzgesagt-Grade High-Density 5-Plane Storybook &
// Modern Environments (15 Multi-Prop Interior/Exterior Presets + 32 Modular
// 3D-Shaded Props + Cause-and-Effect Interactive Target Extensions).
// Calibrated for 1080x1920 (9:16 Center-Stage Safe Zone: x: 100..880,
// y: 260..1440, Optical Center cx = 500, cy = 920, Raised Ground y = 1340).
// Soft-Volumetric 3D Gradients, Zero Black Outlines. Deterministic fn(t).
// Requires MODULE 1 (window.DK / window.FX).
// ============================================================================
(function () {
  'use strict';

  const DK = (window.DK = window.DK || {});
  const H = (window.H = window.H || DK);
  const FX = (window.FX = window.FX || DK.fx || {});
  const E = (window.E = DK.E || { W: 1080, H: 1920 });

  E.W = H.W = 1080;
  E.H = H.H = 1920;

  const SAFE = (E.SAFE = H.SAFE = DK.SAFE = E.SAFE || {
    x0: 100,
    x1: 880,
    y0: 260,
    y1: 1440,
    cx: 500,
    cy: 920,
    groundY: 1340,
  });

  const {
    clamp,
    lerp,
    ease,
    rng,
    noise,
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
    backdrop,
    text,
    fivePlane,
    FONTS,
  } = DK;

  // ---------- 1. Modular 3D-Shaded Situational Prop Library (FX.prop3D) ----------
  function prop3D(g, x = SAFE.cx, y = SAFE.groundY, s = 1, o = {}) {
    const kind = o.kind || 'labBench';
    const t = o.t !== undefined ? o.t : 0;
    const seed = o.seed || 17;
    const col = o.color || null;

    g.save();
    g.translate(x, y);
    if (o.flipX) g.scale(-1, 1);
    g.scale(s, s);

    if (o.shadow !== false) {
      contactShadow(g, 0, 4, o.shadowW || 88, 11, 0.28);
    }

    switch (kind) {
      // ==================== SCIENCE & MEDICAL PROPS ====================
      case 'labBench': {
        const w = o.w || 240;
        const h = o.h || 115;
        // Brushed steel legs
        rr(g, -w * 0.44, -h, 15, h, 4);
        rr(g, w * 0.44 - 15, -h, 15, h, 4);
        g.fillStyle = cylinderGrad(g, -w * 0.44, -h, w * 0.44, 0, '#64748B', -1);
        g.fill();
        // Cabinet body with soft 3D bevel
        rr(g, -w * 0.42, -h + 18, w * 0.84, h - 28, 8);
        g.fillStyle = cylinderGrad(g, -w * 0.42, -h, w * 0.42, 0, col || '#DCE6F2', -1);
        g.fill();
        // Drawer seams & handles (tonal shading, zero black outlines)
        [-w * 0.21, w * 0.21].forEach((dx) => {
          rr(g, dx - w * 0.18, -h + 28, w * 0.36, 32, 5);
          g.fillStyle = '#C8D6E8';
          g.fill();
          rr(g, dx - 16, -h + 41, 32, 6, 3);
          g.fillStyle = '#64748B';
          g.fill();
        });
        // Epoxy resin chemical-resistant top slab
        rr(g, -w * 0.5, -h - 14, w, 18, 6);
        g.fillStyle = linGrad(g, -w * 0.5, -h - 14, w * 0.5, -h + 4, ['#334155', '#1E293B', '#0F172A']);
        g.fill();
        break;
      }

      case 'microscope': {
        rr(g, -32, -14, 64, 14, 6);
        g.fillStyle = cylinderGrad(g, -32, -14, 32, 0, '#334155', -1);
        g.fill();
        // Curved C-arm
        g.strokeStyle = '#CBD5E1';
        g.lineWidth = 12;
        g.lineCap = 'round';
        g.beginPath();
        g.arc(-6, -48, 32, Math.PI * 0.5, Math.PI * 1.45, false);
        g.stroke();
        // Stage & slide
        rr(g, -22, -46, 44, 7, 3);
        g.fillStyle = '#1E293B';
        g.fill();
        glow(g, 0, -40, 18, '#38BDF8', 0.65);
        // Eyepiece tube
        g.save();
        g.translate(4, -78);
        g.rotate(-0.35);
        rr(g, -8, -28, 16, 36, 4);
        g.fillStyle = cylinderGrad(g, -8, -28, 8, 8, '#94A3B8', -1);
        g.fill();
        rr(g, -10, -34, 20, 8, 3);
        g.fillStyle = '#1E293B';
        g.fill();
        g.restore();
        break;
      }

      case 'centrifuge': {
        rr(g, -46, -68, 92, 68, 14);
        g.fillStyle = cylinderGrad(g, -46, -68, 46, 0, '#E2E8F0', -1);
        g.fill();
        ellipse(g, 0, -68, 42, 14, sphereGrad(g, 0, -68, 42, '#38BDF8'));
        rr(g, -28, -42, 56, 22, 5);
        g.fillStyle = '#0F172A';
        g.fill();
        const rpm = 4000 + Math.round(Math.sin(t * 6) * 150);
        text(g, rpm + ' RPM', 0, -31, { size: 11, font: FONTS.mono, color: '#38C878', weight: 700 });
        break;
      }

      case 'fumeHood': {
        const w = o.w || 240;
        const h = o.h || 330;
        rr(g, -w / 2, -h, w, h, 10);
        g.fillStyle = cylinderGrad(g, -w / 2, -h, w / 2, 0, '#CBD5E1', -1);
        g.fill();
        // Interior chamber with glowing UV/cyan work light
        rr(g, -w * 0.44, -h + 36, w * 0.88, h * 0.52, 6);
        g.fillStyle = linGrad(g, 0, -h + 36, 0, -h * 0.4, ['#1E293B', '#0F172A']);
        g.fill();
        glow(g, 0, -h + 65, 125, '#38BDF8', 0.45);
        // Bubbling flasks inside hood
        [-50, 0, 50].forEach((fx, i) => {
          const fy = -h * 0.44;
          const liqCol = i === 0 ? '#38C878' : i === 1 ? '#F43F5E' : '#38BDF8';
          poly(g, [[fx - 8, fy - 38], [fx + 8, fy - 38], [fx + 22, fy], [fx - 22, fy]], 'rgba(220,242,255,0.35)');
          poly(g, [[fx - 16, fy - 18], [fx + 16, fy - 18], [fx + 21, fy - 2], [fx - 21, fy - 2]], liqCol);
          glow(g, fx, fy - 12, 26, liqCol, 0.55);
          for (let b = 0; b < 3; b++) {
            const by = fy - 14 - ((t * 28 + b * 11 + i * 7) % 28);
            circle(g, fx + Math.sin(t * 5 + b) * 6, by, 3.5, shade(liqCol, 0.35));
          }
        });
        // Sliding tempered glass sash
        const sashH = h * 0.36;
        rr(g, -w * 0.45, -h + 34, w * 0.9, sashH, 4);
        g.fillStyle = 'rgba(186, 230, 253, 0.22)';
        g.fill();
        rr(g, -w * 0.45, -h + 34 + sashH - 8, w * 0.9, 8, 3);
        g.fillStyle = '#F59E0B';
        g.fill();
        break;
      }

      case 'dnaHelix': {
        const h = o.h || 240;
        const turns = 14;
        for (let i = 0; i <= turns; i++) {
          const u = i / turns;
          const py = -h * u;
          const ph = t * 2.4 + u * Math.PI * 3.2;
          const x1 = Math.sin(ph) * 38;
          const x2 = Math.sin(ph + Math.PI) * 38;
          const zOrder = Math.cos(ph);
          seg(g, [[x1, py], [x2, py]], 3.5, i % 2 === 0 ? 'rgba(56, 189, 248, 0.55)' : 'rgba(244, 63, 94, 0.55)');
          const r1 = zOrder > 0 ? 7.5 : 5.5;
          const r2 = zOrder <= 0 ? 7.5 : 5.5;
          circle(g, x1, py, r1, sphereGrad(g, x1, py, r1, '#38BDF8'));
          circle(g, x2, py, r2, sphereGrad(g, x2, py, r2, '#F43F5E'));
        }
        break;
      }

      case 'hospitalBed': {
        const w = o.w || 280;
        // Rolling casters & frame
        [-w * 0.38, w * 0.38].forEach((lx) => {
          rr(g, lx - 8, -75, 16, 65, 4);
          g.fillStyle = '#94A3B8';
          g.fill();
          circle(g, lx, -8, 10, '#334155');
          circle(g, lx, -8, 5, '#CBD5E1');
        });
        // Bed base
        rr(g, -w * 0.46, -82, w * 0.92, 18, 6);
        g.fillStyle = cylinderGrad(g, -w * 0.46, -82, w * 0.46, -64, '#CBD5E1', -1);
        g.fill();
        // Inclined head mattress & flat mattress
        poly(g, [[-w * 0.44, -82], [-w * 0.12, -82], [-w * 0.22, -138], [-w * 0.46, -132]], sphereGrad(g, -w * 0.3, -110, 65, '#F8FAFC'));
        rr(g, -w * 0.44, -106, w * 0.88, 26, 12);
        g.fillStyle = cylinderGrad(g, -w * 0.44, -106, w * 0.44, -80, '#F1F5F9', -1);
        g.fill();
        // Medical blue blanket sheet
        rr(g, -w * 0.1, -108, w * 0.54, 28, 10);
        g.fillStyle = cylinderGrad(g, -w * 0.1, -108, w * 0.44, -80, '#38BDF8', -1);
        g.fill();
        // Soft pillow
        ellipse(g, -w * 0.32, -122, 28, 14, sphereGrad(g, -w * 0.32, -122, 28, '#FFFFFF'), 0.35);
        // Side guard rails
        rr(g, -w * 0.25, -124, w * 0.52, 8, 4);
        g.fillStyle = '#E2E8F0';
        g.fill();
        break;
      }

      case 'icuMonitor':
      case 'ecgMonitor': {
        rr(g, -6, -185, 12, 185, 4);
        g.fillStyle = cylinderGrad(g, -6, -185, 6, 0, '#94A3B8', -1);
        g.fill();
        rr(g, -36, -10, 72, 10, 5);
        g.fillStyle = '#475569';
        g.fill();
        // Monitor bezel
        rr(g, -78, -265, 156, 108, 14);
        g.fillStyle = cylinderGrad(g, -78, -265, 78, -157, '#1E293B', -1);
        g.fill();
        rr(g, -68, -255, 136, 88, 8);
        g.fillStyle = '#090D16';
        g.fill();
        // Live animated ECG & SpO2 waveforms
        const ptsEcg = [];
        for (let i = 0; i <= 28; i++) {
          const u = i / 28;
          const px = lerp(-62, 32, u);
          const phase = (u * 3 - t * 1.8) % 1;
          const spike = phase > 0.45 && phase < 0.55 ? Math.sin((phase - 0.45) * 10 * Math.PI) * -22 : Math.sin(u * 12 + t * 4) * 2;
          ptsEcg.push([px, -225 + spike]);
        }
        seg(g, ptsEcg, 2.5, '#38C878');
        text(g, '98', 48, -232, { size: 20, font: FONTS.mono, color: '#38C878', weight: 700 });
        text(g, '120/80', 44, -192, { size: 13, font: FONTS.mono, color: '#38BDF8', weight: 700 });
        glow(g, 0, -210, 85, '#38C878', 0.22);
        break;
      }

      case 'ivDrip': {
        seg(g, [[0, 0], [0, -245]], 7, '#CBD5E1');
        seg(g, [[-24, -245], [24, -245]], 5, '#CBD5E1');
        rr(g, -28, -8, 56, 8, 4);
        g.fillStyle = '#64748B';
        g.fill();
        // Saline bag
        rr(g, -28, -238, 24, 42, 8);
        g.fillStyle = 'rgba(186, 230, 253, 0.65)';
        g.fill();
        rr(g, -26, -222, 20, 24, 6);
        g.fillStyle = 'rgba(56, 189, 248, 0.55)';
        g.fill();
        break;
      }

      case 'chemicalCabinet': {
        const w = o.w || 140;
        const h = o.h || 290;
        rr(g, -w / 2, -h, w, h, 8);
        g.fillStyle = cylinderGrad(g, -w / 2, -h, w / 2, 0, '#CBD5E1', -1);
        g.fill();
        rr(g, -w * 0.42, -h + 18, w * 0.84, h - 36, 6);
        g.fillStyle = '#0F172A';
        g.fill();
        const cols = ['#38BDF8', '#38C878', '#F59E0B', '#F43F5E'];
        for (let rIdx = 0; rIdx < 3; rIdx++) {
          const sy = -h + 95 + rIdx * 78;
          g.fillStyle = '#475569';
          g.fillRect(-w * 0.42, sy, w * 0.84, 6);
          [-34, 0, 34].forEach((bx, bIdx) => {
            rr(g, bx - 10, sy - 38, 20, 38, 5);
            g.fillStyle = cols[(rIdx + bIdx) % cols.length];
            g.fill();
          });
        }
        break;
      }

      // ==================== TECH, STUDIO & CORPORATE PROPS ====================
      case 'serverRack': {
        const w = o.w || 130;
        const h = o.h || 310;
        rr(g, -w / 2, -h, w, h, 10);
        g.fillStyle = cylinderGrad(g, -w / 2, -h, w / 2, 0, '#1E293B', -1);
        g.fill();
        rr(g, -w * 0.44, -h + 14, w * 0.88, h - 28, 6);
        g.fillStyle = '#0F172A';
        g.fill();
        const r = rng(seed);
        for (let row = 0; row < 8; row++) {
          const ry = -h + 26 + row * 33;
          rr(g, -w * 0.4, ry, w * 0.8, 26, 4);
          g.fillStyle = '#1E293B';
          g.fill();
          for (let led = 0; led < 5; led++) {
            const lx = -w * 0.32 + led * 13;
            const on = Math.sin(t * (5 + led * 2) + row * 1.7 + r() * 6) > -0.2;
            const lCol = led === 4 && o.alert ? '#F43F5E' : led % 2 === 0 ? '#38C878' : '#38BDF8';
            if (on) {
              glow(g, lx, ry + 13, 10, lCol, 0.65);
              circle(g, lx, ry + 13, 3, lCol);
            } else {
              circle(g, lx, ry + 13, 3, '#334155');
            }
          }
        }
        break;
      }

      case 'multiMonitorDesk':
      case 'dualMonitorDesk': {
        const w = o.w || 290;
        const h = 110;
        // Ergonomic desk legs
        rr(g, -w * 0.44, -h, 14, h, 4);
        rr(g, w * 0.44 - 14, -h, 14, h, 4);
        g.fillStyle = '#334155';
        g.fill();
        // Walnut desktop slab
        rr(g, -w * 0.5, -h - 14, w, 16, 6);
        g.fillStyle = cylinderGrad(g, -w * 0.5, -h - 14, w * 0.5, -h, '#8C5832', -1);
        g.fill();
        // Curved monitors
        const positions = kind === 'dualMonitorDesk' ? [-52, 52] : [-86, 0, 86];
        positions.forEach((mx, idx) => {
          const mw = idx === 1 && positions.length === 3 ? 88 : 76;
          const mh = 56;
          const my = -h - 80;
          seg(g, [[mx, -h - 14], [mx, my + mh]], 7, '#475569');
          rr(g, mx - mw / 2, my, mw, mh, 6);
          g.fillStyle = '#0F172A';
          g.fill();
          rr(g, mx - mw / 2 + 4, my + 4, mw - 8, mh - 8, 4);
          g.fillStyle = linGrad(g, mx - mw / 2, my, mx + mw / 2, my + mh, ['#0F2942', '#1E3A8A']);
          g.fill();
          for (let l = 0; l < 4; l++) {
            rr(g, mx - mw * 0.36, my + 12 + l * 10, mw * 0.42 + ((l * 15) % 20), 5, 2);
            g.fillStyle = l === 0 ? '#38BDF8' : l === 1 ? '#F59E0B' : '#38C878';
            g.fill();
          }
          glow(g, mx, my + mh / 2, 60, '#38BDF8', 0.25);
        });
        break;
      }

      case 'ringLight': {
        seg(g, [[0, -45], [-34, 0]], 7, '#1E293B');
        seg(g, [[0, -45], [34, 0]], 7, '#1E293B');
        seg(g, [[0, 0], [0, -210]], 8, '#334155');
        glow(g, 0, -250, 95, '#FFF8E7', 0.65);
        ring(g, 0, -250, 44, 12, '#FFFFFF');
        ring(g, 0, -250, 44, 6, '#FFE4B5');
        rr(g, -16, -260, 32, 22, 5);
        g.fillStyle = '#0F172A';
        g.fill();
        circle(g, 0, -249, 8, '#38BDF8');
        break;
      }

      case 'boardroomTable': {
        const w = o.w || 420;
        const h = 108;
        [-w * 0.28, w * 0.28].forEach((px) => {
          poly(g, [[px - 26, 0], [px + 26, 0], [px + 15, -h], [px - 15, -h]], cylinderGrad(g, px - 26, -h, px + 26, 0, '#334155', -1));
        });
        rr(g, -w / 2, -h - 20, w, 24, 12);
        g.fillStyle = cylinderGrad(g, -w / 2, -h - 20, w / 2, -h, '#6E3F24', -1);
        g.fill();
        rr(g, -w * 0.44, -h - 16, w * 0.88, 6, 3);
        g.fillStyle = 'rgba(255, 255, 255, 0.16)';
        g.fill();
        break;
      }

      case 'stockTickerWall':
      case 'stockTicker': {
        const w = o.w || 520;
        const h = o.h || 240;
        rr(g, -w / 2, -h, w, h, 14);
        g.fillStyle = '#090D16';
        g.fill();
        rr(g, -w / 2 + 8, -h + 8, w - 16, h - 16, 10);
        g.fillStyle = linGrad(g, 0, -h, 0, 0, ['#0F172A', '#1E293B']);
        g.fill();
        const isBull = o.trend !== 'crash';
        const lineCol = isBull ? '#38C878' : '#F43F5E';
        const pts = [];
        for (let i = 0; i <= 16; i++) {
          const u = i / 16;
          const px = lerp(-w * 0.42, w * 0.42, u);
          const slope = isBull ? -u * (h * 0.48) : u * (h * 0.48);
          const base = isBull ? -h * 0.25 : -h * 0.72;
          const py = base + slope + Math.sin(u * 9 + t * 2) * 14;
          pts.push([px, py]);
        }
        seg(g, pts, 5, lineCol);
        glow(g, pts[pts.length - 1][0], pts[pts.length - 1][1], 36, lineCol, 0.75);
        circle(g, pts[pts.length - 1][0], pts[pts.length - 1][1], 7, '#FFFFFF');
        break;
      }

      case 'ergonomicChair': {
        seg(g, [[0, -8], [-28, 0]], 6, '#334155');
        seg(g, [[0, -8], [28, 0]], 6, '#334155');
        seg(g, [[0, -8], [0, -52]], 8, '#475569');
        rr(g, -34, -64, 68, 16, 8);
        g.fillStyle = cylinderGrad(g, -34, -64, 34, -48, col || '#1E293B', -1);
        g.fill();
        rr(g, -28, -148, 56, 82, 16);
        g.fillStyle = cylinderGrad(g, -28, -148, 28, -66, col || '#334155', -1);
        g.fill();
        break;
      }

      // ==================== BEDROOM & HOME PROPS ====================
      case 'modernBed': {
        const w = o.w || 280;
        // Upholstered headboard
        rr(g, -w * 0.48, -195, 34, 195, 12);
        g.fillStyle = cylinderGrad(g, -w * 0.48, -195, -w * 0.48 + 34, 0, '#475569', -1);
        g.fill();
        // Wooden bed frame
        rr(g, -w * 0.46, -58, w * 0.94, 42, 8);
        g.fillStyle = cylinderGrad(g, -w * 0.46, -58, w * 0.48, -16, '#8C5832', -1);
        g.fill();
        seg(g, [[-w * 0.42, -16], [-w * 0.42, 0]], 12, '#5C381E');
        seg(g, [[w * 0.42, -16], [w * 0.42, 0]], 12, '#5C381E');
        // Plush mattress & quilted duvet
        rr(g, -w * 0.4, -104, w * 0.86, 50, 18);
        g.fillStyle = cylinderGrad(g, -w * 0.4, -104, w * 0.46, -54, '#F8FAFC', -1);
        g.fill();
        rr(g, -w * 0.16, -108, w * 0.64, 54, 20);
        g.fillStyle = cylinderGrad(g, -w * 0.16, -108, w * 0.48, -54, col || '#3B82F6', -1);
        g.fill();
        // Pillows
        ellipse(g, -w * 0.28, -116, 34, 17, sphereGrad(g, -w * 0.28, -116, 34, '#FFFFFF'), 0.18);
        ellipse(g, -w * 0.19, -114, 32, 16, sphereGrad(g, -w * 0.19, -114, 32, '#E2E8F0'), 0.22);
        break;
      }

      case 'bookshelf': {
        const w = o.w || 150;
        const h = o.h || 310;
        rr(g, -w / 2, -h, w, h, 8);
        g.fillStyle = cylinderGrad(g, -w / 2, -h, w / 2, 0, '#6E472B', -1);
        g.fill();
        rr(g, -w * 0.43, -h + 14, w * 0.86, h - 28, 4);
        g.fillStyle = '#3E2718';
        g.fill();
        const bookCols = ['#E53935', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899'];
        for (let sIdx = 0; sIdx < 4; sIdx++) {
          const sy = -h + 76 + sIdx * 60;
          g.fillStyle = '#8C5C38';
          g.fillRect(-w * 0.45, sy, w * 0.9, 10);
          let bx = -w * 0.38;
          for (let b = 0; b < 6; b++) {
            const bw = 11 + ((b * 7 + sIdx * 3) % 8);
            const bh = 34 + ((b * 11 + sIdx * 5) % 14);
            rr(g, bx, sy - bh, bw, bh, 2);
            g.fillStyle = cylinderGrad(g, bx, sy - bh, bx + bw, sy, bookCols[(b + sIdx) % bookCols.length], -1);
            g.fill();
            bx += bw + 3;
          }
        }
        break;
      }

      case 'pottedPlant': {
        poly(g, [[-24, 0], [24, 0], [32, -56], [-32, -56]], cylinderGrad(g, -32, -56, 32, 0, '#B85D38', -1));
        rr(g, -35, -64, 70, 10, 4);
        g.fillStyle = '#9C4A28';
        g.fill();
        const leaves = [
          [-26, -110, -0.4],
          [0, -132, 0],
          [26, -108, 0.4],
          [-16, -88, -0.25],
          [18, -86, 0.25],
        ];
        leaves.forEach(([lx, ly, rot], idx) => {
          ellipse(g, lx, ly, 16, 38, sphereGrad(g, lx, ly, 38, idx % 2 === 0 ? '#389648' : '#2E7D3B'), rot);
        });
        break;
      }

      // ==================== MILITARY, BUNKER, PRISON & COURT PROPS ====================
      case 'warTableMap':
      case 'radarTable': {
        const w = o.w || 350;
        const h = 112;
        poly(g, [[-w * 0.38, 0], [w * 0.38, 0], [w * 0.48, -h], [-w * 0.48, -h]], cylinderGrad(g, -w * 0.48, -h, w * 0.48, 0, '#1E293B', -1));
        ellipse(g, 0, -h, w * 0.52, 34, '#0F172A');
        ellipse(g, 0, -h, w * 0.46, 28, '#09192B');
        glow(g, 0, -h - 45, 185, '#00F2FE', 0.42);
        for (let rIdx = 1; rIdx <= 3; rIdx++) {
          g.strokeStyle = alpha('#38BDF8', 0.45);
          g.lineWidth = 2;
          g.beginPath();
          g.ellipse(0, -h - rIdx * 12, w * 0.12 * rIdx, 8 * rIdx, 0, 0, Math.PI * 2);
          g.stroke();
        }
        [-60, 12, 68].forEach((tx, idx) => {
          const ty = -h - 28 - Math.sin(t * 3 + idx) * 6;
          const tCol = idx === 1 ? '#F43F5E' : '#38BDF8';
          glow(g, tx, ty, 22, tCol, 0.8);
          poly(g, [[tx, ty + 10], [tx - 8, ty - 6], [tx + 8, ty - 6]], tCol);
        });
        break;
      }

      case 'defconBoard': {
        const w = o.w || 310;
        const h = o.h || 160;
        rr(g, -w / 2, -h, w, h, 10);
        g.fillStyle = '#0F172A';
        g.fill();
        const defCols = ['#F43F5E', '#F97316', '#FACC15', '#38C878', '#38BDF8'];
        const activeLvl = o.level || 2;
        for (let i = 0; i < 5; i++) {
          const lx = -w * 0.36 + i * (w * 0.18);
          const isAct = i + 1 === activeLvl;
          rr(g, lx - 22, -h + 26, 44, 44, 6);
          g.fillStyle = isAct ? defCols[i] : alpha(defCols[i], 0.18);
          g.fill();
          if (isAct) glow(g, lx, -h + 48, 38, defCols[i], 0.75);
          text(g, String(i + 1), lx, -h + 49, { size: 24, font: FONTS.mono, color: isAct ? '#090D16' : '#64748B', weight: 700 });
        }
        text(g, 'STRATEGIC DEFENSE COMMAND', 0, -30, { size: 15, font: FONTS.mono, color: '#94A3B8', weight: 700, spacing: 1.5 });
        break;
      }

      case 'prisonBars': {
        const w = o.w || 320;
        const h = o.h || 620;
        rr(g, -w / 2, -h, w, 22, 4);
        rr(g, -w / 2, -h * 0.48, w, 16, 4);
        rr(g, -w / 2, -18, w, 18, 4);
        g.fillStyle = cylinderGrad(g, -w / 2, -h, w / 2, 0, '#475569', -1);
        g.fill();
        const count = Math.floor(w / 44);
        for (let i = 0; i <= count; i++) {
          const bx = lerp(-w * 0.46, w * 0.46, i / count);
          rr(g, bx - 6, -h, 12, h, 5);
          g.fillStyle = cylinderGrad(g, bx - 6, -h, bx + 6, -h, '#64748B', -1);
          g.fill();
        }
        break;
      }

      case 'judgeBench': {
        const w = o.w || 340;
        const h = o.h || 195;
        rr(g, -w * 0.52, -32, w * 1.04, 32, 6);
        g.fillStyle = cylinderGrad(g, -w * 0.52, -32, w * 0.52, 0, '#4A2511', -1);
        g.fill();
        rr(g, -w * 0.48, -h, w * 0.96, h - 28, 10);
        g.fillStyle = cylinderGrad(g, -w * 0.48, -h, w * 0.48, -28, '#6E3B1E', -1);
        g.fill();
        [-w * 0.28, 0, w * 0.28].forEach((px) => {
          rr(g, px - 38, -h + 28, 76, h - 78, 6);
          g.fillStyle = '#522B15';
          g.fill();
        });
        rr(g, -w * 0.52, -h - 18, w * 1.04, 22, 6);
        g.fillStyle = cylinderGrad(g, -w * 0.52, -h - 18, w * 0.52, -h, '#8A4B29', -1);
        g.fill();
        circle(g, 0, -h * 0.56, 32, sphereGrad(g, 0, -h * 0.56, 32, '#F5B942'));
        ring(g, 0, -h * 0.56, 26, 2.5, '#FFF3B0');
        break;
      }

      case 'witnessStand': {
        const w = 148;
        const h = 135;
        rr(g, -w / 2, -h, w, h, 8);
        g.fillStyle = cylinderGrad(g, -w / 2, -h, w / 2, 0, '#7C4424', -1);
        g.fill();
        rr(g, -w * 0.55, -h - 14, w * 1.1, 16, 5);
        g.fillStyle = '#5C3018';
        g.fill();
        seg(g, [[28, -h - 14], [38, -h - 46], [18, -h - 56]], 4, '#334155');
        ellipse(g, 14, -h - 58, 8, 6, '#0F172A', -0.3);
        break;
      }

      // ==================== MILITARY BASE & SPACE LAUNCH PROPS ====================
      case 'radarDish': {
        poly(g, [[-48, 0], [48, 0], [22, -165], [-22, -165]], cylinderGrad(g, -48, -165, 48, 0, '#64748B', -1));
        seg(g, [[-38, -35], [28, -110]], 5, '#475569');
        seg(g, [[38, -35], [-28, -110]], 5, '#475569');
        const pan = Math.sin(t * 1.4 + seed) * 0.35;
        g.save();
        g.translate(0, -185);
        g.rotate(-0.35 + pan * 0.25);
        ellipse(g, 0, 0, 28, 72, sphereGrad(g, -10, -15, 72, '#E2E8F0'));
        seg(g, [[0, 0], [48, 0]], 5, '#94A3B8');
        circle(g, 50, 0, 8, '#F43F5E');
        glow(g, 50, 0, 26, '#F43F5E', 0.75);
        g.restore();
        break;
      }

      case 'armoredHumvee': {
        const w = 240;
        poly(
          g,
          [
            [-w * 0.48, -34],
            [-w * 0.48, -96],
            [-w * 0.18, -96],
            [-w * 0.04, -138],
            [w * 0.38, -138],
            [w * 0.48, -88],
            [w * 0.48, -34],
          ],
          cylinderGrad(g, -w * 0.48, -138, w * 0.48, -34, col || '#5C6B4E', -1)
        );
        poly(g, [[-w * 0.14, -96], [-w * 0.02, -128], [w * 0.12, -128], [w * 0.12, -96]], '#1E293B');
        rr(g, w * 0.16, -128, 38, 32, 4);
        g.fillStyle = '#1E293B';
        g.fill();
        [-w * 0.3, w * 0.3].forEach((wx) => {
          circle(g, wx, -32, 32, '#1E2024');
          circle(g, wx, -32, 17, '#4A5562');
          circle(g, wx, -32, 6, '#1E2024');
        });
        break;
      }

      case 'orbitalRocket': {
        const w = o.w || 88;
        const h = o.h || 620;
        const liftY = o.liftOff ? -Math.pow(clamp(o.liftOff, 0, 1), 2.2) * 780 : 0;
        g.save();
        g.translate(0, liftY);
        // Side solid rocket boosters
        [-w * 0.68, w * 0.68].forEach((bx) => {
          const bw = w * 0.42;
          const bh = h * 0.58;
          rr(g, bx - bw / 2, -bh, bw, bh, 8);
          g.fillStyle = cylinderGrad(g, bx - bw / 2, -bh, bx + bw / 2, 0, '#F1F5F9', -1);
          g.fill();
          poly(g, [[bx - bw / 2, -bh], [bx + bw / 2, -bh], [bx, -bh - 48]], cylinderGrad(g, bx - bw / 2, -bh - 48, bx + bw / 2, -bh, '#E2E8F0', -1));
        });
        // Main core stage cylinder
        rr(g, -w / 2, -h * 0.82, w, h * 0.82, 10);
        g.fillStyle = cylinderGrad(g, -w / 2, -h * 0.82, w / 2, 0, '#FFFFFF', -1);
        g.fill();
        // Black interstage rings
        g.fillStyle = '#1E293B';
        g.fillRect(-w / 2, -h * 0.52, w, 28);
        g.fillRect(-w / 2, -h * 0.12, w, 22);
        // Payload fairing nosecone
        poly(g, [[-w * 0.52, -h * 0.82], [w * 0.52, -h * 0.82], [w * 0.32, -h * 0.94], [0, -h], [-w * 0.32, -h * 0.94]], cylinderGrad(g, -w * 0.52, -h, w * 0.52, -h * 0.82, '#F8FAFC', -1));
        // Cryogenic venting vapor plumes along rocket body
        for (let v = 0; v < 4; v++) {
          const vy = -h * (0.28 + v * 0.14);
          const drift = (t * 35 + v * 20) % 75;
          ellipse(g, w * 0.5 + drift, vy + drift * 0.2, 28 + drift * 0.4, 14, alpha('#FFFFFF', Math.max(0, 0.42 - drift / 180)));
        }
        // Ignition exhaust plume if firing
        if (o.firing || o.liftOff > 0) {
          glow(g, 0, 25, 220, '#FF6B1A', 0.9);
          poly(g, [[-w * 0.65, 0], [w * 0.65, 0], [w * 1.1, 145 + Math.sin(t * 28) * 25], [-w * 1.1, 145 + Math.cos(t * 28) * 25]], linGrad(g, 0, 0, 0, 155, ['#FFFFFF', '#FFD54F', '#FF5E1A', 'rgba(255,60,0,0)']));
        }
        g.restore();
        break;
      }

      case 'launchGantry':
      case 'rocketGantry': {
        const w = 110;
        const h = o.h || 640;
        rr(g, -w / 2, -h, w, h, 6);
        g.fillStyle = cylinderGrad(g, -w / 2, -h, w / 2, 0, '#C94A29', -1);
        g.fill();
        for (let ty = -40; ty > -h + 40; ty -= 55) {
          seg(g, [[-w * 0.44, ty], [w * 0.44, ty - 48]], 5, '#9E351A');
          seg(g, [[w * 0.44, ty], [-w * 0.44, ty - 48]], 5, '#9E351A');
        }
        [-h * 0.35, -h * 0.58, -h * 0.78].forEach((ay) => {
          rr(g, w * 0.45, ay - 10, 95, 18, 4);
          g.fillStyle = '#E05A36';
          g.fill();
        });
        break;
      }

      // ==================== SUBURBAN, URBAN & HISTORICAL PROPS ====================
      case 'suburbanHouse': {
        const w = o.w || 280;
        const h = o.h || 235;
        const wallCol = col || '#E8EEF5';
        const roofCol = o.roofColor || '#475569';
        rr(g, -w * 0.48, -h * 0.68, w * 0.96, h * 0.68, 6);
        g.fillStyle = cylinderGrad(g, -w * 0.48, -h * 0.68, w * 0.48, 0, wallCol, -1);
        g.fill();
        // Garage door on left
        rr(g, -w * 0.42, -h * 0.48, w * 0.36, h * 0.48, 4);
        g.fillStyle = shade(wallCol, -0.14);
        g.fill();
        for (let p = 1; p <= 3; p++) {
          seg(g, [[-w * 0.4, -h * 0.12 * p], [-w * 0.08, -h * 0.12 * p]], 2.5, shade(wallCol, -0.24));
        }
        // Front porch door & warm lit windows
        rr(g, w * 0.04, -h * 0.46, 36, h * 0.46, 4);
        g.fillStyle = '#9E2A2B';
        g.fill();
        rr(g, w * 0.21, -h * 0.46, 48, 44, 4);
        g.fillStyle = '#BAE6FD';
        g.fill();
        // Pitched gable roof
        poly(g, [[-w * 0.54, -h * 0.66], [w * 0.54, -h * 0.66], [w * 0.38, -h], [-w * 0.38, -h]], linGrad(g, 0, -h, 0, -h * 0.66, [shade(roofCol, 0.16), roofCol, shade(roofCol, -0.22)]));
        break;
      }

      case 'sportsCar3D':
      case 'suvCar': {
        const w = kind === 'suvCar' ? 235 : 215;
        const carCol = col || (kind === 'suvCar' ? '#2563EB' : '#E53935');
        const roofH = kind === 'suvCar' ? -104 : -88;
        poly(
          g,
          [
            [-w * 0.48, -22],
            [-w * 0.46, -56],
            [-w * 0.22, -64],
            [-w * 0.06, roofH],
            [w * 0.28, roofH],
            [w * 0.44, -58],
            [w * 0.48, -22],
          ],
          cylinderGrad(g, -w * 0.48, roofH, w * 0.48, -22, carCol, -1)
        );
        poly(g, [[-w * 0.18, -60], [-w * 0.04, roofH + 6], [w * 0.24, roofH + 6], [w * 0.35, -60]], '#1E293B');
        [-w * 0.28, w * 0.28].forEach((wx) => {
          circle(g, wx, -24, 24, '#18181B');
          circle(g, wx, -24, 14, '#CBD5E1');
          circle(g, wx, -24, 5, carCol);
        });
        break;
      }

      case 'spiceStall':
      case 'marketCanopy': {
        const w = o.w || 220;
        const h = o.h || 195;
        rr(g, -w * 0.46, -78, w * 0.92, 78, 6);
        g.fillStyle = cylinderGrad(g, -w * 0.46, -78, w * 0.46, 0, '#7C4A28', -1);
        g.fill();
        const spices = [
          [-66, '#F59E0B'],
          [-22, '#E53935'],
          [22, '#10B981'],
          [66, '#F97316'],
        ];
        spices.forEach(([sx, sCol]) => {
          ellipse(g, sx, -78, 20, 8, '#D9B382');
          poly(g, [[sx - 18, -78], [sx + 18, -78], [sx, -106]], sphereGrad(g, sx, -90, 22, sCol));
        });
        seg(g, [[-w * 0.44, -78], [-w * 0.44, -h]], 8, '#5C361C');
        seg(g, [[w * 0.44, -78], [w * 0.44, -h]], 8, '#5C361C');
        poly(g, [[-w * 0.54, -h + 24], [w * 0.54, -h + 24], [w * 0.44, -h - 14], [-w * 0.44, -h - 14]], cylinderGrad(g, -w * 0.54, -h - 14, w * 0.54, -h + 24, col || '#C92A2A', -1));
        for (let k = -4; k <= 4; k++) {
          circle(g, k * 24, -h + 24, 10, '#F5B942');
        }
        break;
      }

      case 'woodenCrane': {
        seg(g, [[-45, 0], [0, -240]], 14, '#6E4224');
        seg(g, [[45, 0], [0, -240]], 14, '#5C361C');
        seg(g, [[0, -220], [115, -295]], 12, '#7C4C2B');
        seg(g, [[-25, -120], [52, -255]], 7, '#4A2B16');
        const sway = Math.sin(t * 2.2 + seed) * 10;
        seg(g, [[110, -292], [110 + sway, -145]], 3.5, '#D9B382');
        circle(g, 110 + sway, -125, 26, sphereGrad(g, 110 + sway, -125, 26, '#C89658'));
        break;
      }

      case 'sieveTable':
      case 'trenchGrid': {
        if (kind === 'trenchGrid') {
          for (let bx = -130; bx < 130; bx += 52) {
            rr(g, bx, -44, 48, 22, 3);
            rr(g, bx, -22, 48, 22, 3);
            g.fillStyle = '#B84C2E';
            g.fill();
          }
          seg(g, [[-145, -52], [145, -52]], 2.5, '#F8FAFC');
          break;
        }
        seg(g, [[-55, -68], [-72, 0]], 8, '#6E472B');
        seg(g, [[55, -68], [72, 0]], 8, '#6E472B');
        const shakeX = Math.sin(t * 14) * 4;
        rr(g, -65 + shakeX, -82, 130, 18, 4);
        g.fillStyle = '#8C5C38';
        g.fill();
        circle(g, -18 + shakeX, -85, 8, '#B84C2E');
        circle(g, 12 + shakeX, -86, 10, '#C85A38');
        for (let d = 0; d < 5; d++) {
          const dy = -60 + ((t * 45 + d * 12) % 55);
          circle(g, -30 + d * 15, dy, 3, 'rgba(168, 110, 72, 0.55)');
        }
        break;
      }

      default: {
        rr(g, -40, -80, 80, 80, 10);
        g.fillStyle = sphereGrad(g, 0, -40, 50, col || '#64748B');
        g.fill();
      }
    }

    g.restore();
  }

  // ---------- 2. High-Density 9:16 Midground & Interior Scene Builders (15 Presets) ----------
  function renderHighDensityMidground(g, t = 0, o = {}) {
    const preset = o.preset || 'scienceLab';
    const y = o.y !== undefined ? o.y : SAFE.groundY; // 1340

    switch (preset) {
      // ==================== 1. SCIENCE LAB (9:16 INTERIOR) ====================
      case 'scienceLab': {
        // Vertical Cleanroom Walls spanning y: 0..1340
        g.fillStyle = linGrad(g, 0, 0, 0, y, ['#141D2E', '#1E293B', '#283548', '#1E293B']);
        g.fillRect(-360, -200, E.W + 720, y + 200);
        // Brushed aluminum dado rails
        g.fillStyle = '#334155';
        g.fillRect(-360, y - 260, E.W + 720, 12);
        g.fillRect(-360, 520, E.W + 720, 8);

        // Periodic Table & Molecular Formula Glass Whiteboard centered in Upper-Mid Safe Zone (cx = 500, y = 580..820)
        rr(g, 210, 560, 580, 260, 12);
        g.fillStyle = 'rgba(15, 23, 42, 0.88)';
        g.fill();
        for (let rIdx = 0; rIdx < 5; rIdx++) {
          for (let cIdx = 0; cIdx < 14; cIdx++) {
            if (rIdx === 0 && cIdx > 0 && cIdx < 13) continue;
            if ((rIdx === 1 || rIdx === 2) && cIdx > 1 && cIdx < 8) continue;
            const bCol = cIdx < 2 ? '#F43F5E' : cIdx < 8 ? '#38BDF8' : cIdx < 12 ? '#F59E0B' : '#38C878';
            rr(g, 240 + cIdx * 37, 592 + rIdx * 42, 31, 35, 4);
            g.fillStyle = alpha(bCol, 0.74);
            g.fill();
          }
        }

        // Overhead Cleanroom LED Light Panels + Volumetric God Rays
        [280, 500, 720].forEach((lx) => {
          rr(g, lx - 95, 250, 190, 20, 8);
          g.fillStyle = '#F8FAFC';
          g.fill();
          glow(g, lx, 265, 165, '#BAE6FD', 0.45);
          if (FX.godRays) FX.godRays(g, lx, 265, { count: 4, angle: Math.PI * 0.5, spread: 0.42, len: 1080, color: '#BAE6FD', a: 0.08, t });
        });

        // Polished Epoxy Floor & Specular Reflection Pool at y = 1340
        g.fillStyle = linGrad(g, 0, y, 0, E.H + 200, ['#1E293B', '#0F172A', '#090D16']);
        g.fillRect(-360, y, E.W + 720, E.H - y + 300);
        if (FX.pool) FX.pool(g, SAFE.cx, y + 95, 420, 95, '#38BDF8', 0.18);

        // 9:16 Safe-Zone Lab Props (x: 150..830, y = 1340)
        prop3D(g, 240, y, 0.92, { kind: 'labBench', w: 230, t });
        prop3D(g, 195, y - 106, 0.88, { kind: 'microscope', t, shadow: false });
        prop3D(g, 285, y - 106, 0.85, { kind: 'centrifuge', t, shadow: false });
        prop3D(g, 500, y, 0.98, { kind: 'fumeHood', w: 250, h: 340, t });
        prop3D(g, 755, y, 0.92, { kind: 'labBench', w: 220, t });
        prop3D(g, 755, y - 122, 0.92, { kind: 'dnaHelix', h: 215, t, shadow: false });
        break;
      }

      // ==================== 2. TECH STUDIO / CREATOR LAB (9:16 INTERIOR) ====================
      case 'techStudio': {
        g.fillStyle = linGrad(g, 0, 0, 0, y, ['#090D18', '#0D1322', '#161F35', '#0F172A']);
        g.fillRect(-360, -200, E.W + 720, y + 200);
        // Geometric 3D Acoustic Foam Wall Panels & Vertical Neon Accent Tubes
        for (let px = 190; px <= 810; px += 205) {
          for (let py = 460; py <= 880; py += 105) {
            poly(g, [[px, py - 44], [px + 44, py], [px, py + 44], [px - 44, py]], cylinderGrad(g, px - 44, py - 44, px + 44, py + 44, '#1E293B', -1));
          }
          const tubeCol = Math.round(px / 205) % 2 === 0 ? '#00F2FE' : '#FF4D94';
          glow(g, px + 102, 670, 95, tubeCol, 0.42);
          seg(g, [[px + 102, 430], [px + 102, 910]], 7, '#FFFFFF');
        }
        if (FX.storybookGround) FX.storybookGround(g, y, { style: 'woodFloor', baseCol: '#3E2A1E' });
        prop3D(g, 205, y, 0.96, { kind: 'serverRack', t });
        prop3D(g, 500, y, 1.02, { kind: 'multiMonitorDesk', w: 300, t });
        prop3D(g, 710, y, 0.96, { kind: 'ringLight', t });
        prop3D(g, 825, y, 0.92, { kind: 'bookshelf', w: 135, t });
        break;
      }

      // ==================== 3. MODERN BEDROOM (9:16 INTERIOR) ====================
      case 'modernBedroom': {
        const isNight = o.isNight !== false;
        g.fillStyle = linGrad(g, 0, 0, 0, y, isNight ? ['#141A2E', '#1E2742', '#252F4C', '#1B233B'] : ['#CBD5E1', '#E2E8F0', '#CBD5E1']);
        g.fillRect(-360, -200, E.W + 720, y + 200);
        // Tall Vertical Picture Window at Center Stage (x: 310..690, y: 460..880)
        rr(g, 310, 460, 380, 420, 14);
        g.fillStyle = linGrad(g, 310, 460, 310, 880, isNight ? ['#09122C', '#1E3A8A'] : ['#389EE8', '#BAE6FD']);
        g.fill();
        circle(g, 595, 555, 36, isNight ? '#FEF08A' : '#FFFBEB');
        for (let wy = 485; wy < 865; wy += 26) {
          seg(g, [[318, wy], [682, wy]], 3, 'rgba(255,255,255,0.28)');
        }
        // Hardwood Floor & Woven Area Rug at y = 1340
        g.fillStyle = linGrad(g, 0, y, 0, E.H + 200, ['#5C3A24', '#3E2516']);
        g.fillRect(-360, y, E.W + 720, E.H - y + 300);
        ellipse(g, SAFE.cx, y + 85, 360, 58, '#334155');
        ellipse(g, SAFE.cx, y + 85, 325, 46, '#475569');
        // Bedroom Furniture inside Safe Zone (x: 150..830)
        prop3D(g, 285, y, 0.96, { kind: 'modernBed', w: 265, color: '#4F46E5', t });
        // Nightstand & Glowing Bedside Lamp at x = 485
        rr(g, 445, y - 85, 80, 85, 8);
        g.fillStyle = '#6E472B';
        g.fill();
        poly(g, [[465, y - 145], [505, y - 145], [515, y - 102], [455, y - 102]], '#FDE68A');
        glow(g, 485, y - 125, 155, '#F59E0B', 0.58);
        prop3D(g, 695, y, 0.9, { kind: 'dualMonitorDesk', w: 220, t });
        prop3D(g, 835, y, 0.92, { kind: 'pottedPlant', t });
        break;
      }

      // ==================== 4. HOSPITAL ICU (9:16 INTERIOR) ====================
      case 'hospitalICU': {
        g.fillStyle = linGrad(g, 0, 0, 0, y, ['#CBD5E1', '#E2E8F0', '#F1F5F9', '#CBD5E1']);
        g.fillRect(-360, -200, E.W + 720, y + 200);
        // Medical Teal Wall Stripe & Headwall Gas Outlets
        g.fillStyle = '#0D9488';
        g.fillRect(-360, y - 380, E.W + 720, 52);
        rr(g, 240, y - 510, 520, 82, 10);
        g.fillStyle = '#94A3B8';
        g.fill();
        // Sterile Hospital Floor
        g.fillStyle = linGrad(g, 0, y, 0, E.H + 200, ['#CBD5E1', '#94A3B8']);
        g.fillRect(-360, y, E.W + 720, E.H - y + 300);
        // Privacy Curtain on Left Edge
        for (let cx = 90; cx <= 210; cx += 34) {
          rr(g, cx, 360, 36, y - 400, 14);
          g.fillStyle = cylinderGrad(g, cx, 360, cx + 36, 360, '#BAE6FD', -1);
          g.fill();
        }
        prop3D(g, 265, y, 1.02, { kind: 'ivDrip', t });
        prop3D(g, 500, y, 1.06, { kind: 'hospitalBed', w: 280, t });
        prop3D(g, 755, y, 1.04, { kind: 'icuMonitor', t });
        break;
      }

      // ==================== 5. MILITARY BUNKER / WAR ROOM (9:16 INTERIOR) ====================
      case 'militaryBunker': {
        g.fillStyle = linGrad(g, 0, 0, 0, y, ['#060911', '#090D16', '#111827', '#1E293B']);
        g.fillRect(-360, -200, E.W + 720, y + 200);
        // Angled Concrete Blast Ribs
        for (let rx = 140; rx <= 900; rx += 250) {
          poly(g, [[rx - 26, 0], [rx + 26, 0], [rx + 46, y], [rx - 46, y]], '#0F172A');
        }
        // DEFCON Strategic Board Centered Above War Table (x = 500, y = 690)
        prop3D(g, 500, 690, 1.12, { kind: 'defconBoard', level: o.defcon || 2, t, shadow: false });
        // Tactical Red/Amber Warning Beacons
        [220, 780].forEach((bx) => {
          const pulse = 0.5 + 0.5 * Math.sin(t * 6);
          glow(g, bx, 380, 150, '#F43F5E', 0.48 * pulse);
          circle(g, bx, 380, 14, '#F43F5E');
        });
        g.fillStyle = linGrad(g, 0, y, 0, E.H + 200, ['#111827', '#090D16']);
        g.fillRect(-360, y, E.W + 720, E.H - y + 300);
        prop3D(g, 205, y, 0.96, { kind: 'serverRack', alert: true, t });
        prop3D(g, 500, y, 1.06, { kind: 'warTableMap', w: 350, t });
        prop3D(g, 790, y, 0.92, { kind: 'dualMonitorDesk', w: 210, t });
        break;
      }

      // ==================== 6. PRISON CELL (9:16 INTERIOR) ====================
      case 'prisonCell': {
        g.fillStyle = linGrad(g, 0, 0, 0, y, ['#161B24', '#1E2430', '#2D3748', '#1A202C']);
        g.fillRect(-360, -200, E.W + 720, y + 200);
        for (let cy = 280; cy < y; cy += 62) {
          seg(g, [[-200, cy], [E.W + 200, cy]], 2, 'rgba(0,0,0,0.24)');
        }
        // High Barred Window with Dramatic Volumetric God Rays (x = 560, y = 460)
        rr(g, 470, 440, 180, 140, 8);
        g.fillStyle = '#090D16';
        g.fill();
        for (let bx = 500; bx <= 620; bx += 30) {
          seg(g, [[bx, 440], [bx, 580]], 6, '#475569');
        }
        if (FX.godRays) FX.godRays(g, 560, 510, { count: 5, angle: Math.PI * 0.56, spread: 0.35, len: 920, color: '#CBD5E1', a: 0.15, t });
        // Chalk tally marks on wall
        for (let m = 0; m < 4; m++) {
          const mx = 420 + m * 12;
          seg(g, [[mx, 780], [mx, 818]], 3, 'rgba(226,232,240,0.45)');
        }
        seg(g, [[414, 812], [464, 786]], 3, 'rgba(226,232,240,0.45)');
        // Steel Bunk Bed on Left (x: 150..390)
        rr(g, 150, y - 270, 240, 270, 6);
        g.fillStyle = 'rgba(0,0,0,0.18)';
        g.fill();
        seg(g, [[160, y], [160, y - 280]], 12, '#475569');
        seg(g, [[380, y], [380, y - 280]], 12, '#475569');
        [y - 78, y - 215].forEach((by) => {
          rr(g, 160, by, 220, 22, 6);
          g.fillStyle = '#64748B';
          g.fill();
          rr(g, 166, by - 18, 208, 20, 8);
          g.fillStyle = '#94A3B8';
          g.fill();
        });
        g.fillStyle = linGrad(g, 0, y, 0, E.H + 200, ['#1A202C', '#0F141C']);
        g.fillRect(-360, y, E.W + 720, E.H - y + 300);
        // Cell Bars on Right Wing (x = 760)
        prop3D(g, 760, y, 1.0, { kind: 'prisonBars', w: 280, h: 780, t, shadow: false });
        break;
      }

      // ==================== 7. COURTROOM (9:16 INTERIOR) ====================
      case 'courtroom': {
        g.fillStyle = linGrad(g, 0, 0, 0, y, ['#2E1A0E', '#3E2414', '#5C361E', '#4A2B18']);
        g.fillRect(-360, -200, E.W + 720, y + 200);
        // Neoclassical Fluted Pilasters & Tall Arched Windows
        [160, 410, 610, 840].forEach((px) => {
          rr(g, px - 24, 240, 48, y - 240, 6);
          g.fillStyle = cylinderGrad(g, px - 24, 240, px + 24, y, '#D6C7B2', -1);
          g.fill();
        });
        [285, 725].forEach((wx) => {
          rr(g, wx - 68, 380, 136, 360, 68);
          g.fillStyle = linGrad(g, wx, 380, wx, 740, ['#BAE6FD', '#E0F2FE']);
          g.fill();
          if (FX.godRays) FX.godRays(g, wx, 520, { count: 4, angle: Math.PI * 0.46, spread: 0.34, len: 880, color: '#FEF3C7', a: 0.14, t });
        });
        // Marble & Red Carpet Courtroom Floor at y = 1340
        g.fillStyle = linGrad(g, 0, y, 0, E.H + 200, ['#4A2511', '#2E160A']);
        g.fillRect(-360, y, E.W + 720, E.H - y + 300);
        poly(g, [[360, y], [640, y], [760, E.H], [240, E.H]], '#9E2A2B');
        // Judge's Bench, Witness Stand & Counsel Table inside Safe Zone
        prop3D(g, 540, y, 1.04, { kind: 'judgeBench', w: 330, t });
        prop3D(g, 245, y, 0.98, { kind: 'witnessStand', t });
        prop3D(g, 790, y, 0.68, { kind: 'boardroomTable', w: 230, t });
        break;
      }

      // ==================== 8. CORPORATE OFFICE / BOARDROOM (9:16 INTERIOR) ====================
      case 'corporateOffice': {
        // Panoramic Glass Curtain Wall Looking Out Over Skyline
        g.fillStyle = linGrad(g, 0, 0, 0, y, ['#1452A8', '#1E68C8', '#68B5F5', '#E0F2FE']);
        g.fillRect(-360, -200, E.W + 720, y + 200);
        if (FX.skyline) FX.skyline(g, { style: 'modern', y: y - 40, color: '#475569', lit: 0.25 });
        for (let mx = 140; mx <= 880; mx += 240) {
          g.fillStyle = '#1E293B';
          g.fillRect(mx - 7, 0, 14, y);
        }
        g.fillStyle = '#1E293B';
        g.fillRect(-360, 480, E.W + 720, 14);
        g.fillRect(-360, 920, E.W + 720, 12);
        // Polished Slate Floor
        g.fillStyle = linGrad(g, 0, y, 0, E.H + 200, ['#334155', '#1E293B']);
        g.fillRect(-360, y, E.W + 720, E.H - y + 300);
        // Stock Ticker Wall & Boardroom Table Centered at x = 500
        prop3D(g, 500, 820, 1.0, { kind: 'stockTickerWall', w: 540, h: 250, trend: o.trend || 'bull', t, shadow: false });
        prop3D(g, 500, y, 1.04, { kind: 'boardroomTable', w: 460, t });
        break;
      }

      // ==================== 9. SUBURBAN STREET (9:16 EXTERIOR) ====================
      case 'suburbanStreet': {
        for (let fx = -200; fx <= E.W + 200; fx += 34) {
          poly(g, [[fx, y - 45], [fx + 10, y - 58], [fx + 20, y - 45], [fx + 20, y], [fx, y]], '#F8FAFC');
        }
        g.fillStyle = '#E2E8F0';
        g.fillRect(-200, y - 38, E.W + 400, 7);
        g.fillRect(-200, y - 16, E.W + 400, 7);
        if (FX.tree) FX.tree(g, 160, y, 1.12, '#3B8C44', 'oak');
        prop3D(g, 430, y, 1.06, { kind: 'suburbanHouse', w: 290, color: '#F1F5F9', roofColor: '#334155', t });
        prop3D(g, 745, y + 12, 0.96, { kind: 'sportsCar3D', color: '#2563EB', t });
        if (FX.tree) FX.tree(g, 880, y, 1.05, '#449E48', 'oak');
        break;
      }

      // ==================== 10. MODERN DOWNTOWN (9:16 EXTERIOR) ====================
      case 'modernDowntown': {
        if (FX.architecture1P) FX.architecture1P(g, { style: 'modern', vx: SAFE.cx, vy: 580, groundY: y, lit: 0.35, mood: 'day' });
        if (FX.lampPost) {
          FX.lampPost(g, 210, y, 290, { on: false });
          FX.lampPost(g, 790, y, 290, { on: false });
        }
        prop3D(g, 690, y + 16, 0.95, { kind: 'sportsCar3D', color: '#E53935', t });
        break;
      }

      // ==================== 11. MILITARY BASE (9:16 EXTERIOR) ====================
      case 'militaryBase': {
        // Arched Steel Aircraft Hangar on Left/Center
        g.save();
        g.translate(330, y);
        rr(g, -185, -195, 370, 195, 95);
        g.fillStyle = cylinderGrad(g, -185, -195, 185, 0, '#475569', -1);
        g.fill();
        rr(g, -115, -125, 230, 125, 12);
        g.fillStyle = '#0F172A';
        g.fill();
        g.restore();
        prop3D(g, 580, y, 1.12, { kind: 'radarDish', t });
        prop3D(g, 755, y + 8, 0.96, { kind: 'armoredHumvee', t });
        break;
      }

      // ==================== 12. SPACE LAUNCH PAD (9:16 EXTERIOR) ====================
      case 'launchPad': {
        if (FX.waterBody) FX.waterBody(g, t, { x: -240, y: y - 75, w: E.W + 480, h: 80, color: '#1E68C8', waves: true });
        // Concrete flame trench pad apron centered around x = 500
        poly(g, [[160, y], [840, y], [780, y - 55], [220, y - 55]], '#64748B');
        // Cryogenic LOX spherical storage tank on left (x = 205)
        circle(g, 205, y - 108, 72, sphereGrad(g, 205, y - 108, 72, '#F8FAFC'));
        seg(g, [[160, y - 50], [150, y]], 9, '#94A3B8');
        seg(g, [[250, y - 50], [260, y]], 9, '#94A3B8');
        // Tall Vertical Launch Gantry & Orbital Rocket in Hero Center (x = 420 & x = 575)
        prop3D(g, 415, y - 45, 1.05, { kind: 'launchGantry', h: 640, t });
        prop3D(g, 575, y - 45, 1.05, { kind: 'orbitalRocket', h: 620, firing: o.firing, liftOff: o.liftOff, t });
        break;
      }

      // ==================== 13. ANCIENT HARBOR (9:16 EXTERIOR) ====================
      case 'ancientHarbor': {
        if (FX.storybookScene && _origStorybookScene) {
          _origStorybookScene(g, t, { preset: 'harborWharf', y });
        }
        prop3D(g, 535, y - 50, 0.95, { kind: 'woodenCrane', t });
        prop3D(g, 755, y - 50, 0.92, { kind: 'spiceStall', color: '#D97706', t });
        break;
      }

      // ==================== 14. TEMPLE BAZAAR (9:16 EXTERIOR) ====================
      case 'templeBazaar': {
        if (FX.structure3D) {
          FX.structure3D(g, 500, y, 260, 410, { kind: 'gopuram', t });
          FX.structure3D(g, 195, y, 185, 195, { kind: 'mandapam', t });
          FX.structure3D(g, 815, y, 185, 195, { kind: 'mandapam', t });
        }
        prop3D(g, 310, y, 0.95, { kind: 'spiceStall', color: '#C92A2A', t });
        prop3D(g, 695, y, 0.95, { kind: 'spiceStall', color: '#0D9488', t });
        break;
      }

      // ==================== 15. ARCHAEOLOGY DIG SITE (9:16 EXTERIOR) ====================
      case 'archaeologyDigSite': {
        // Exposed Ancient Baked-Brick Trench Walls & Terracotta Ring Well inside x: 150..830
        for (let bx = 160; bx < 520; bx += 52) {
          rr(g, bx, y - 44, 48, 22, 3);
          rr(g, bx, y - 22, 48, 22, 3);
          g.fillStyle = '#B84C2E';
          g.fill();
        }
        // Terracotta Ring Well at x = 440
        for (let rIdx = 0; rIdx < 4; rIdx++) {
          ellipse(g, 440, y - 12 - rIdx * 18, 44, 12, '#A84224');
          ellipse(g, 440, y - 14 - rIdx * 18, 34, 8, '#3E1E12');
        }
        seg(g, [[145, y - 55], [545, y - 55]], 2.5, '#F8FAFC');
        prop3D(g, 635, y, 1.02, { kind: 'sieveTable', t });
        if (FX.structure3D) FX.structure3D(g, 805, y, 165, 155, { kind: 'thatchedHut', t });
        break;
      }
    }
  }

  // ---------- 3. Hook Into FX.storybookScene & FX.interactiveProp ----------
  const _origStorybookScene = FX.storybookScene;
  const RICH_PRESETS = {
    scienceLab: true,
    techStudio: true,
    modernBedroom: true,
    hospitalICU: true,
    militaryBunker: true,
    prisonCell: true,
    courtroom: true,
    corporateOffice: true,
    suburbanStreet: true,
    modernDowntown: true,
    militaryBase: true,
    launchPad: true,
    ancientHarbor: true,
    templeBazaar: true,
    archaeologyDigSite: true,
  };

  FX.storybookScene = function (g, t = 0, o = {}) {
    if (o && RICH_PRESETS[o.preset]) {
      renderHighDensityMidground(g, t, Object.assign({ y: SAFE.groundY }, o));
      return;
    }
    if (_origStorybookScene) _origStorybookScene(g, t, Object.assign({ y: SAFE.groundY }, o));
  };

  const _origInteractiveProp = FX.interactiveProp;
  FX.interactiveProp = function (g, o = {}) {
    const {
      kind = 'choppableTree',
      x = 580,
      y = SAFE.groundY,
      cutTime = 1.8,
      lt = 0,
      gt = 0,
    } = o;

    if (kind === 'labStation') {
      prop3D(g, x, y, 0.85, { kind: 'labBench', w: 180, t: gt });
      const reacted = lt >= cutTime;
      const col = reacted ? '#F43F5E' : '#38BDF8';
      g.save();
      g.translate(x, y - 102);
      poly(g, [[-12, -36], [12, -36], [24, 0], [-24, 0]], 'rgba(220,242,255,0.4)');
      poly(g, [[-18, -18], [18, -18], [22, -2], [-22, -2]], col);
      if (reacted) {
        glow(g, 0, -25, 75, '#F43F5E', 0.85);
        for (let i = 0; i < 6; i++) {
          const by = -28 - (((lt - cutTime) * 65 + i * 14) % 65);
          circle(g, Math.sin(gt * 6 + i) * 14, by, 7, 'rgba(244, 63, 94, 0.65)');
        }
      }
      g.restore();
      return;
    }

    if (kind === 'serverTerminal') {
      prop3D(g, x, y, 0.95, { kind: 'serverRack', alert: lt >= cutTime, t: gt });
      return;
    }

    if (kind === 'gavelBlock') {
      g.save();
      g.translate(x, y);
      rr(g, -28, -58, 56, 58, 6);
      g.fillStyle = '#5C3018';
      g.fill();
      ellipse(g, 0, -58, 22, 7, '#8A4B29');
      if (lt >= cutTime && lt < cutTime + 0.45) {
        const u = (lt - cutTime) / 0.45;
        ring(g, 0, -60, 18 + u * 55, 3 * (1 - u), '#F5B942');
      }
      g.restore();
      return;
    }

    if (_origInteractiveProp) _origInteractiveProp(g, Object.assign({ x: 580, y: SAFE.groundY }, o));
  };

  // ---------- 4. Complete One-Call 5-Plane 9:16 Rich Environment Wrappers ----------
  const INTERIOR_PRESETS = {
    scienceLab: true,
    techStudio: true,
    modernBedroom: true,
    hospitalICU: true,
    militaryBunker: true,
    prisonCell: true,
    courtroom: true,
    corporateOffice: true,
  };

  function richEnv(g, cam, gt = 0, o = {}) {
    const preset = typeof o === 'string' ? o : o.preset || 'scienceLab';
    const y = o.y !== undefined ? o.y : SAFE.groundY; // 1340
    const isInt = !!INTERIOR_PRESETS[preset];
    const m = DK.mood(o.mood || (isInt ? 'interiorCool' : 'clearDay'));

    fivePlane(g, cam, {
      bgSky: (g) => {
        if (!isInt) {
          backdrop(g, m.sky, [-E.W, -E.H, E.W * 3, E.H * 3], { t: gt, clouds: true });
          if (FX.sun && o.isNight !== true) FX.sun(g, SAFE.cx, 420, 62);
        }
      },
      bgFarDepth: isInt ? 0.65 : 0.35,
      bgFarBlur: isInt ? 0 : 1.8,
      bgFar: (g) => {
        if (!isInt && FX.hills) {
          FX.hills(g, { seed: 11, y: y - 100, amp: 95, color: m.distantHills || '#5A8F76' });
        }
      },
      mgBackDepth: 0.78,
      mgBackBlur: 0,
      mgBack: (g) => {
        renderHighDensityMidground(g, gt, Object.assign({ y }, o, { preset }));
        if (!isInt && FX.storybookGround) {
          const gStyle = preset === 'suburbanStreet' || preset === 'modernDowntown' ? 'flagstone' : 'earthPath';
          FX.storybookGround(g, y, { style: gStyle, baseCol: m.road || '#6E523C', grassCol: m.grass || '#489C4E' });
        }
      },
      mgHero: (g) => {
        if (typeof o.mgHero === 'function') o.mgHero(g);
      },
      fgBokehDepth: 1.45,
      fgBokehBlur: 10,
      fgBokeh: (g) => {
        if (typeof o.fgBokeh === 'function') {
          o.fgBokeh(g);
        } else if (FX.bokehOrbs) {
          FX.bokehOrbs(g, gt, { count: 9, color: m.practical || '#FFD54F', a: 0.12 });
        }
      },
    });
  }

  function infographicEnv(g, cam, gt = 0, o = {}) {
    richEnv(g, cam, gt, o);
  }

  function envInterior(g, t = 0, o = {}) {
    renderHighDensityMidground(g, t, Object.assign({ y: SAFE.groundY }, o));
  }

  function envExterior(g, t = 0, o = {}) {
    const y = o.y !== undefined ? o.y : SAFE.groundY;
    renderHighDensityMidground(g, t, Object.assign({ y }, o));
    if (FX.storybookGround) {
      const gStyle = o.preset === 'suburbanStreet' || o.preset === 'modernDowntown' ? 'flagstone' : 'earthPath';
      FX.storybookGround(g, y, { style: gStyle, baseCol: o.roadCol || '#6E523C', grassCol: o.grassCol || '#489C4E' });
    }
  }

  // Export to Global Namespaces
  const ENVS = (window.ENVS = {
    prop3D,
    richEnv,
    infographicEnv,
    envInterior,
    envExterior,
    renderHighDensityMidground,
    RICH_PRESETS,
  });

  FX.prop3D = DK.prop3D = H.prop3D = prop3D;
  FX.richEnv = DK.richEnv = H.richEnv = richEnv;
  FX.infographicEnv = DK.infographicEnv = H.infographicEnv = infographicEnv;
  FX.envInterior = DK.envInterior = H.envInterior = envInterior;
  FX.envExterior = DK.envExterior = H.envExterior = envExterior;
})();