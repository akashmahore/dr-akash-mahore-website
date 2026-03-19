/* ============================================================
   three-setup.js – Canvas 2D Animations
   Dr. Akash Mahore Website
   Provides 3D-like animations using the Canvas 2D API
   (no external dependencies required)
   ============================================================ */

(function () {
  'use strict';

  /* ---- Utility ---- */
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ============================================================
     HERO CANVAS – particle field with animated torus rings
     ============================================================ */
  function initHeroCanvas() {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var rings = [
      { r: 0, rTarget: 180, angle: 0, speed: 0.003, tiltX: 0.4, tiltY: 0.2, opacity: 0.2 },
      { r: 0, rTarget: 240, angle: 1.2, speed: -0.004, tiltX: 0.7, tiltY: 0.5, opacity: 0.15 },
      { r: 0, rTarget: 130, angle: 2.5, speed: 0.006, tiltX: 1.1, tiltY: 0.3, opacity: 0.25 }
    ];
    var W, H, cx, cy;

    function resize() {
      W = canvas.parentElement.offsetWidth;
      H = canvas.parentElement.offsetHeight;
      canvas.width = W;
      canvas.height = H;
      cx = W / 2;
      cy = H / 2;
    }
    resize();
    window.addEventListener('resize', function () { resize(); rebuildParticles(); });

    function rebuildParticles() {
      particles = [];
      var count = Math.min(180, Math.floor(W * H / 5000));
      for (var i = 0; i < count; i++) {
        particles.push({
          x: rand(0, W), y: rand(0, H),
          vx: rand(-0.15, 0.15), vy: rand(-0.15, 0.15),
          r: rand(1, 3),
          alpha: rand(0.2, 0.6)
        });
      }
    }
    rebuildParticles();

    // Draw an ellipse to simulate a tilted ring
    function drawRing(ring) {
      var rx = ring.r;
      var ry = ring.r * Math.abs(Math.sin(ring.tiltX));
      if (ry < 2) return;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ring.angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, ring.tiltY, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(41, 182, 246, ' + ring.opacity + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    var raf;
    function animate(ts) {
      raf = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, W, H);

      // Animate ring radii (grow in on load)
      rings.forEach(function (ring) {
        ring.r = lerp(ring.r, ring.rTarget, 0.02);
        ring.angle += ring.speed;
        ring.tiltX += 0.004;
        drawRing(ring);
      });

      // Particles
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(41, 182, 246, ' + p.alpha + ')';
        ctx.fill();
      });
    }
    animate(0);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { animate(0); }
    });
  }

  /* ============================================================
     ABOUT CANVAS – 3D eye model using Canvas 2D
     ============================================================ */
  function initAboutCanvas() {
    var canvas = document.getElementById('aboutCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var orbitParticles = [];
    var W, H, cx, cy;

    function resize() {
      W = canvas.parentElement.offsetWidth;
      H = canvas.parentElement.offsetHeight || canvas.parentElement.offsetWidth;
      canvas.width = W;
      canvas.height = H;
      cx = W / 2;
      cy = H / 2;
    }
    resize();
    window.addEventListener('resize', resize);

    // Build orbit particles
    var ORBIT_COUNT = 60;
    for (var i = 0; i < ORBIT_COUNT; i++) {
      var a = (i / ORBIT_COUNT) * Math.PI * 2;
      var baseR = Math.min(W, H) * 0.42;
      orbitParticles.push({
        baseAngle: a,
        r: baseR + rand(-12, 12),
        size: rand(2, 5),
        speed: rand(0.004, 0.01) * (Math.random() > 0.5 ? 1 : -1),
        alpha: rand(0.3, 0.8)
      });
    }

    var mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.6;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.6;
    });

    var time = 0;
    var raf;

    function drawEye(tiltX, tiltY) {
      var R = Math.min(W, H) * 0.3;
      var pulse = 1 + Math.sin(time * 1.5) * 0.025;

      // Sclera (white of the eye)
      var grad = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.1, cx, cy, R * pulse);
      grad.addColorStop(0, 'rgba(220, 238, 255, 0.9)');
      grad.addColorStop(1, 'rgba(160, 200, 240, 0.7)');
      ctx.beginPath();
      ctx.ellipse(cx + tiltX * 30, cy + tiltY * 20, R * pulse, R * pulse * 0.85, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(2, 136, 209, 0.3)';
      ctx.shadowBlur = 30;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Iris
      var irisR = R * 0.52 * pulse;
      var irisGrad = ctx.createRadialGradient(cx, cy, irisR * 0.1, cx, cy, irisR);
      irisGrad.addColorStop(0, 'rgba(2, 100, 180, 0.95)');
      irisGrad.addColorStop(0.5, 'rgba(2, 136, 209, 0.9)');
      irisGrad.addColorStop(1, 'rgba(0, 61, 130, 0.85)');
      ctx.beginPath();
      ctx.ellipse(cx + tiltX * 20, cy + tiltY * 14, irisR, irisR * 0.88, 0, 0, Math.PI * 2);
      ctx.fillStyle = irisGrad;
      ctx.fill();

      // Iris texture lines
      for (var i = 0; i < 16; i++) {
        var a = (i / 16) * Math.PI * 2 + time * 0.2;
        ctx.beginPath();
        ctx.moveTo(cx + tiltX * 20, cy + tiltY * 14);
        ctx.lineTo(
          cx + tiltX * 20 + Math.cos(a) * irisR,
          cy + tiltY * 14 + Math.sin(a) * irisR * 0.88
        );
        ctx.strokeStyle = 'rgba(0, 40, 100, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Pupil
      var pupilR = irisR * 0.42 * (1 + Math.sin(time * 0.5) * 0.08);
      ctx.beginPath();
      ctx.ellipse(cx + tiltX * 20, cy + tiltY * 14, pupilR, pupilR * 0.88, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 10, 30, 0.95)';
      ctx.fill();

      // Specular highlight
      ctx.beginPath();
      ctx.ellipse(cx + tiltX * 20 + irisR * 0.22, cy + tiltY * 14 - irisR * 0.22, irisR * 0.12, irisR * 0.08, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fill();

      // Eyelid curves
      ctx.beginPath();
      ctx.moveTo(cx - R * 1.05 + tiltX * 20, cy + tiltY * 14);
      ctx.quadraticCurveTo(cx + tiltX * 20, cy - R * 0.8 + tiltY * 14, cx + R * 1.05 + tiltX * 20, cy + tiltY * 14);
      ctx.strokeStyle = 'rgba(100, 160, 200, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - R * 1.05 + tiltX * 20, cy + tiltY * 14);
      ctx.quadraticCurveTo(cx + tiltX * 20, cy + R * 0.75 + tiltY * 14, cx + R * 1.05 + tiltX * 20, cy + tiltY * 14);
      ctx.strokeStyle = 'rgba(100, 160, 200, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    function animate() {
      raf = requestAnimationFrame(animate);
      time += 0.016;
      ctx.clearRect(0, 0, W, H);

      // Background glow
      var bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.55);
      bgGrad.addColorStop(0, 'rgba(211, 234, 255, 0.8)');
      bgGrad.addColorStop(1, 'rgba(224, 244, 255, 0.3)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Orbit particles
      orbitParticles.forEach(function (p) {
        p.baseAngle += p.speed;
        var px = cx + Math.cos(p.baseAngle) * p.r;
        var py = cy + Math.sin(p.baseAngle) * p.r * 0.35;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(2, 136, 209, ' + p.alpha + ')';
        ctx.fill();
      });

      // Eye
      drawEye(mouseX, mouseY);
    }
    animate();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { animate(); }
    });
  }

  /* ============================================================
     WHY-CHOOSE BACKGROUND – animated rings
     ============================================================ */
  function initWhyCanvas() {
    var wrap = document.getElementById('whyCanvas');
    if (!wrap) return;

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    wrap.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var W, H, cx, cy;

    function resize() {
      W = wrap.offsetWidth;
      H = wrap.offsetHeight;
      canvas.width = W;
      canvas.height = H;
      cx = W / 2;
      cy = H / 2;
    }
    resize();
    window.addEventListener('resize', resize);

    var rings = [
      { r: 200, ry: 70,  angle: 0,    speed: 0.003, opacity: 0.18 },
      { r: 320, ry: 120, angle: 1.0,  speed: -0.004, opacity: 0.12 },
      { r: 150, ry: 90,  angle: 2.2,  speed: 0.005, opacity: 0.22 },
      { r: 420, ry: 140, angle: 3.5,  speed: -0.002, opacity: 0.1 }
    ];

    var raf;
    function animate() {
      raf = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, W, H);

      rings.forEach(function (ring) {
        ring.angle += ring.speed;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ring.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, ring.r, ring.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(41, 182, 246, ' + ring.opacity + ')';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });
    }
    animate();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { animate(); }
    });
  }

  /* ---- DOM Particle emitter (hero section decorative dots) ---- */
  function initDOMParticles() {
    var container = document.getElementById('heroParticles');
    if (!container) return;

    for (var i = 0; i < 22; i++) {
      var dot = document.createElement('div');
      var size = rand(2, 7);
      dot.style.cssText = [
        'position:absolute',
        'border-radius:50%',
        'background:rgba(41,182,246,' + rand(0.1, 0.35) + ')',
        'width:' + size + 'px',
        'height:' + size + 'px',
        'left:' + rand(0, 100) + '%',
        'top:' + rand(0, 100) + '%',
        'animation:drift ' + rand(7, 14) + 's ease-in-out infinite',
        'animation-delay:' + rand(0, 6) + 's'
      ].join(';');
      container.appendChild(dot);
    }

    if (!document.getElementById('driftKF')) {
      var s = document.createElement('style');
      s.id = 'driftKF';
      s.textContent = '@keyframes drift{0%,100%{transform:translateY(0)translateX(0)}25%{transform:translateY(-18px)translateX(8px)}50%{transform:translateY(-32px)translateX(-8px)}75%{transform:translateY(-12px)translateX(12px)}}';
      document.head.appendChild(s);
    }
  }

  /* ---- Init all ---- */
  function init() {
    initDOMParticles();
    initHeroCanvas();
    initAboutCanvas();
    initWhyCanvas();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
