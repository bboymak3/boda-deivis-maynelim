/* ============================================================
   BODA DEIVIS & MAYNELIM — Capa de efectos
   Sobre 3D + música + partículas doradas + bordes que brillan
   al desplazar + botones animados + inclinación 3D.
   ============================================================ */
(function() {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ========================================================
  // PARTÍCULAS DORADAS (canvas con profundidad / parallax)
  // ========================================================
  var Particles = (function() {
    var canvas = document.getElementById('fx-particles');
    if (!canvas || reduceMotion) return { burst: function() {}, start: function() {} };

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var dust = [];
    var sparks = [];
    var mouseX = 0, mouseY = 0;
    var running = false;

    // Sprite de brillo dorado pre-renderizado (más barato que gradientes por frame)
    var glow = document.createElement('canvas');
    glow.width = glow.height = 64;
    (function() {
      var g = glow.getContext('2d');
      var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, 'rgba(255, 248, 225, 1)');
      grd.addColorStop(0.25, 'rgba(240, 210, 130, 0.85)');
      grd.addColorStop(0.6, 'rgba(201, 163, 82, 0.25)');
      grd.addColorStop(1, 'rgba(201, 163, 82, 0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, 64, 64);
    })();

    // Destello en forma de estrella de 4 puntas
    var star = document.createElement('canvas');
    star.width = star.height = 64;
    (function() {
      var g = star.getContext('2d');
      g.translate(32, 32);
      g.fillStyle = 'rgba(255, 246, 216, 0.95)';
      g.beginPath();
      for (var i = 0; i < 4; i++) {
        g.rotate(Math.PI / 2);
        g.moveTo(0, 0);
        g.quadraticCurveTo(3, -3, 0, -30);
        g.quadraticCurveTo(-3, -3, 0, 0);
      }
      g.fill();
      g.globalCompositeOperation = 'lighter';
      g.drawImage(glow, -14, -14, 28, 28);
    })();

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var target = Math.round(Math.min(70, Math.max(26, (W * H) / 16000)));
      while (dust.length < target) dust.push(makeDust(true));
      dust.length = target;
    }

    function makeDust(randomY) {
      var z = Math.random() * 0.8 + 0.2; // profundidad: 0.2 lejos → 1 cerca
      return {
        x: Math.random() * W,
        y: randomY ? Math.random() * H : H + 20,
        z: z,
        size: 3 + z * 9,
        vy: -(0.08 + z * 0.35),
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.004 + Math.random() * 0.01,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        isStar: Math.random() < 0.22
      };
    }

    function burst(x, y, amount) {
      amount = amount || 120;
      for (var i = 0; i < amount; i++) {
        var a = Math.random() * Math.PI * 2;
        var v = 2 + Math.random() * 7;
        sparks.push({
          x: x, y: y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 2,
          life: 1,
          decay: 0.008 + Math.random() * 0.012,
          size: 6 + Math.random() * 14,
          isStar: Math.random() < 0.45,
          rot: Math.random() * Math.PI
        });
      }
      start();
    }

    function trail(x, y) {
      if (sparks.length > 160) return;
      sparks.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 0.8,
        vy: Math.random() * 0.8 + 0.2,
        life: 0.9,
        decay: 0.03,
        size: 5 + Math.random() * 7,
        isStar: Math.random() < 0.5,
        rot: Math.random() * Math.PI
      });
    }

    var lastScroll = window.scrollY;
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      var scrollDelta = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      var px = (mouseX - W / 2) / W;
      var py = (mouseY - H / 2) / H;

      for (var i = 0; i < dust.length; i++) {
        var p = dust[i];
        p.sway += p.swaySpeed;
        p.twinkle += p.twinkleSpeed;
        p.y += p.vy - scrollDelta * p.z * 0.25; // parallax: lo cercano se mueve más
        p.x += Math.sin(p.sway) * 0.25 * p.z;
        if (p.y < -30) { dust[i] = makeDust(false); continue; }
        if (p.y > H + 40) p.y = -20;
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;

        var alpha = (0.25 + 0.45 * p.z) * (0.55 + 0.45 * Math.sin(p.twinkle));
        var s = p.size * (p.isStar ? 1.1 : 0.8);
        var dx = p.x - px * 30 * p.z;
        var dy = p.y - py * 20 * p.z;
        ctx.globalAlpha = alpha;
        ctx.drawImage(p.isStar ? star : glow, dx - s / 2, dy - s / 2, s, s);
      }

      for (var j = sparks.length - 1; j >= 0; j--) {
        var k = sparks[j];
        k.vx *= 0.97;
        k.vy = k.vy * 0.97 + 0.06;
        k.x += k.vx;
        k.y += k.vy;
        k.life -= k.decay;
        k.rot += 0.05;
        if (k.life <= 0) { sparks.splice(j, 1); continue; }
        ctx.globalAlpha = Math.min(1, k.life * 1.4);
        var ks = k.size * (0.6 + k.life * 0.4);
        if (k.isStar) {
          ctx.save();
          ctx.translate(k.x, k.y);
          ctx.rotate(k.rot);
          ctx.drawImage(star, -ks / 2, -ks / 2, ks, ks);
          ctx.restore();
        } else {
          ctx.drawImage(glow, k.x - ks / 2, k.y - ks / 2, ks, ks);
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }

    function start() {
      if (running || document.hidden) return;
      running = true;
      requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) running = false;
      else start();
    });
    if (finePointer) {
      var lastTrail = 0;
      window.addEventListener('pointermove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        var now = performance.now();
        if (now - lastTrail > 45) {
          lastTrail = now;
          trail(e.clientX, e.clientY);
        }
      }, { passive: true });
    }

    resize();
    mouseX = W / 2;
    mouseY = H / 2;
    return { burst: burst, start: start };
  })();

  // ========================================================
  // MÚSICA DE FONDO: "Hasta Ese Día" (Lasso)
  // Intenta sonar sola al entrar. Si el navegador bloquea el
  // sonido hasta que la persona toque la pantalla (lo normal en
  // celulares), empieza con el primer toque, por ejemplo al
  // abrir el sobre. Controles: empezar de nuevo, reproducir/
  // pausar, bajar y subir volumen.
  // ========================================================
  var Music = (function() {
    var audio = document.getElementById('bg-music');
    var player = document.getElementById('music-player');
    if (!audio || !player) return { start: function() {} };

    var playBtn = player.querySelector('[data-action="toggle"]');
    var levelFill = player.querySelector('.mp-level-fill');
    var levelText = player.querySelector('.mp-level-text');
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    var actx = null;
    var gain = null;
    var STEP = 0.1;
    var volume = 0.7;
    var userPaused = false; // si la persona pausó, no volver a sonar sola

    try {
      var saved = parseFloat(localStorage.getItem('boda-volumen'));
      if (saved >= 0 && saved <= 1) volume = saved;
    } catch (e) {}

    // En iPhone el volumen de <audio> no se puede cambiar por código:
    // se controla con un nodo de ganancia de Web Audio. Se crea dentro
    // de un toque, que es cuando el navegador lo permite.
    function ensureGraph() {
      if (!AudioCtx || gain) {
        if (actx && actx.state === 'suspended') actx.resume();
        return;
      }
      try {
        actx = new AudioCtx();
        var source = actx.createMediaElementSource(audio);
        gain = actx.createGain();
        gain.gain.value = audio.paused ? 0 : volume;
        source.connect(gain);
        gain.connect(actx.destination);
        audio.volume = 1;
        if (actx.state === 'suspended') actx.resume();
      } catch (e) {
        gain = null; // sin Web Audio: se usa audio.volume
      }
    }

    function applyVolume(v, fade) {
      if (gain && actx) {
        var now = actx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(v, now + (fade ? 1.5 : 0.15));
      } else {
        try { audio.volume = v; } catch (e) {}
      }
    }

    function renderLevel() {
      var pct = Math.round(volume * 100);
      levelFill.style.width = pct + '%';
      levelText.textContent = pct + '%';
      player.querySelector('[data-action="down"]').disabled = volume <= 0;
      player.querySelector('[data-action="up"]').disabled = volume >= 1;
    }

    function setPlaying(state) {
      player.classList.toggle('is-playing', state);
      playBtn.setAttribute('aria-pressed', String(state));
      playBtn.setAttribute('aria-label', state ? 'Pausar música' : 'Reproducir música');
    }

    function play(fromGesture) {
      if (fromGesture) ensureGraph();
      applyVolume(0, false);
      var p = audio.play();
      var onStart = function() {
        setPlaying(true);
        applyVolume(volume, true); // entra suave
      };
      if (p && p.then) return p.then(onStart);
      onStart();
      return Promise.resolve();
    }

    function pause() {
      audio.pause();
      setPlaying(false);
    }

    // Llamado desde el botón del sobre y desde el primer toque
    function start() {
      if (userPaused) return;
      waitForGesture.off();
      if (audio.paused) play(true).catch(function() {});
      else ensureGraph();
    }

    var waitForGesture = (function() {
      var events = ['pointerdown', 'touchend', 'keydown'];
      function handler(e) {
        if (e.target.closest && e.target.closest('#music-player')) return; // los botones lo manejan
        start();
      }
      return {
        on: function() { events.forEach(function(ev) { document.addEventListener(ev, handler, true); }); },
        off: function() { events.forEach(function(ev) { document.removeEventListener(ev, handler, true); }); }
      };
    })();

    player.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      ensureGraph();
      waitForGesture.off();
      if (action === 'toggle') {
        if (audio.paused) { userPaused = false; play(true).catch(function() {}); }
        else { userPaused = true; pause(); }
      } else if (action === 'restart') {
        userPaused = false;
        audio.currentTime = 0;
        if (audio.paused) play(true).catch(function() {});
      } else if (action === 'up' || action === 'down') {
        volume = Math.round(Math.min(1, Math.max(0, volume + (action === 'up' ? STEP : -STEP))) * 10) / 10;
        try { localStorage.setItem('boda-volumen', String(volume)); } catch (err) {}
        if (!audio.paused) applyVolume(volume, false);
        renderLevel();
      }
    });

    audio.addEventListener('pause', function() { setPlaying(false); });
    audio.addEventListener('play', function() { setPlaying(true); });

    // Pausar al salir de la pestaña y reanudar al volver
    var pausedByHide = false;
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        if (!audio.paused) { pausedByHide = true; audio.pause(); }
      } else if (pausedByHide) {
        pausedByHide = false;
        if (actx && actx.state === 'suspended') actx.resume();
        audio.play().catch(function() {});
      }
    });

    renderLevel();

    // Intento de inicio automático al entrar
    play(false).catch(function() {
      setPlaying(false);
      waitForGesture.on();
    });

    return { start: start };
  })();

  // ========================================================
  // INTRO: abrir el sobre
  // ========================================================
  function initIntro() {
    var intro = document.getElementById('intro');
    var openBtn = document.getElementById('intro-open');

    function finish() {
      root.classList.remove('intro-pending');
      root.classList.add('intro-done');
    }

    if (!intro || !openBtn) { finish(); return; }

    Particles.start();
    openBtn.focus({ preventScroll: true });

    var opened = false;
    function open() {
      if (opened) return;
      opened = true;
      Music.start();
      intro.classList.add('is-opening');

      var seal = intro.querySelector('.env-seal');
      var r = (seal || openBtn).getBoundingClientRect();
      Particles.burst(r.left + r.width / 2, r.top + r.height / 2, 90);

      var t1 = reduceMotion ? 50 : 1900;
      setTimeout(function() {
        intro.classList.add('is-done');
        finish();
        Particles.burst(window.innerWidth / 2, window.innerHeight * 0.45, 140);
        window.scrollTo(0, 0);
        setTimeout(function() { intro.remove(); }, 1000);
      }, t1);
    }

    openBtn.addEventListener('click', open);
    intro.querySelector('.envelope').addEventListener('click', open);
  }

  // ========================================================
  // MARCOS DORADOS + BRILLO AL ENTRAR EN PANTALLA
  // ========================================================
  var FRAME_SELECTOR = '.fx-frame, .countdown-item, .details-card, .gift-card, .verse-card, ' +
    '.rsvp-form, .timeline-content, .donation-card, .gallery-event-item, .gallery-item';

  function initFrames() {
    var frames = document.querySelectorAll(FRAME_SELECTOR);
    frames.forEach(function(el) {
      el.classList.add('fx-frame');
      var border = document.createElement('span');
      border.className = 'fx-border';
      border.setAttribute('aria-hidden', 'true');
      var sheen = document.createElement('span');
      sheen.className = 'fx-sheen';
      sheen.setAttribute('aria-hidden', 'true');
      el.appendChild(sheen);
      el.appendChild(border);
    });

    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add('fx-in-view');
          // repetir el destello cada vez que vuelve a aparecer
          el.classList.remove('fx-shine');
          void el.offsetWidth;
          el.classList.add('fx-shine');
        } else {
          el.classList.remove('fx-in-view', 'fx-shine');
        }
      });
    }, { threshold: 0.3 });
    frames.forEach(function(el) { io.observe(el); });
  }

  // ========================================================
  // SCROLL: los bordes giran y brillan más mientras desplazas
  // ========================================================
  function initScrollGlow() {
    var glow = 0;
    var lastY = window.scrollY;
    var looping = false;

    function update() {
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      root.style.setProperty('--scroll-deg', (y * 0.35).toFixed(1) + 'deg');
      root.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);

      var speed = Math.abs(y - lastY);
      lastY = y;
      glow = Math.max(glow * 0.92, Math.min(1, speed / 25));
      root.style.setProperty('--scroll-glow', glow.toFixed(3));

      if (glow > 0.01) {
        requestAnimationFrame(update);
      } else {
        root.style.setProperty('--scroll-glow', '0');
        looping = false;
      }
    }

    window.addEventListener('scroll', function() {
      if (!looping) {
        looping = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  // ========================================================
  // INCLINACIÓN 3D
  // ========================================================
  function initTilt() {
    var card = document.querySelector('.invite-card');
    var hero = document.querySelector('.hero-invite');

    // Tarjeta principal: sigue al cursor por todo el hero
    if (card && hero && !reduceMotion) {
      if (finePointer) {
        hero.addEventListener('pointermove', function(e) {
          var r = hero.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5;
          var y = (e.clientY - r.top) / r.height - 0.5;
          card.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg');
          card.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
        });
        hero.addEventListener('pointerleave', function() {
          card.style.setProperty('--ry', '0deg');
          card.style.setProperty('--rx', '0deg');
        });
      } else if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
        // Android: inclinar el teléfono mueve la tarjeta
        window.addEventListener('deviceorientation', function(e) {
          if (e.gamma == null) return;
          var ry = Math.max(-10, Math.min(10, e.gamma / 3));
          var rx = Math.max(-8, Math.min(8, (e.beta - 45) / 4));
          card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
          card.style.setProperty('--rx', (-rx).toFixed(2) + 'deg');
        });
      }
    }

    if (!finePointer || reduceMotion) return;

    document.querySelectorAll('.details-card, .gift-card, .countdown-item, .verse-card, .donation-card').forEach(function(el) {
      el.classList.add('fx-tilt');
      var glare = document.createElement('span');
      glare.className = 'fx-glare';
      glare.setAttribute('aria-hidden', 'true');
      el.appendChild(glare);

      el.addEventListener('pointermove', function(e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        el.classList.add('is-tilting');
        el.style.setProperty('--ry', ((x - 0.5) * 14).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((0.5 - y) * 12).toFixed(2) + 'deg');
        el.style.setProperty('--lift', '-8px');
        el.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function() {
        el.classList.remove('is-tilting');
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--lift', '0px');
      });
    });
  }

  // ========================================================
  // BOTONES: brillo, onda al tocar y efecto magnético
  // ========================================================
  function initButtons() {
    var buttons = document.querySelectorAll('.btn-submit, .btn-gallery, .intro-open, .copy-btn, .back-link, .rsvp-btn-primary, .rsvp-btn-whatsapp, .usdt-copy-btn');
    buttons.forEach(function(btn) {
      btn.classList.add('fx-btn');
      // envolver textos sueltos para que queden por encima del brillo
      Array.prototype.slice.call(btn.childNodes).forEach(function(n) {
        if (n.nodeType === 3 && n.textContent.trim()) {
          var span = document.createElement('span');
          span.textContent = n.textContent;
          btn.replaceChild(span, n);
        }
      });
      var shine = document.createElement('span');
      shine.className = 'fx-btn-shine';
      shine.setAttribute('aria-hidden', 'true');
      btn.insertBefore(shine, btn.firstChild);
    });

    // Onda dorada al tocar (botones y círculos)
    document.addEventListener('pointerdown', function(e) {
      var host = e.target.closest('.fx-btn, .circle-icon, .bottom-nav-item');
      if (!host) return;
      var r = host.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 2.2;
      var ripple = document.createElement('span');
      ripple.className = 'fx-ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - r.left) + 'px';
      ripple.style.top = (e.clientY - r.top) + 'px';
      var cs = getComputedStyle(host);
      if (cs.position === 'static') host.style.position = 'relative';
      if (cs.overflow !== 'hidden') host.style.overflow = 'hidden';
      host.appendChild(ripple);
      setTimeout(function() { ripple.remove(); }, 800);
    });

    if (!finePointer || reduceMotion) return;
    document.querySelectorAll('.btn-gallery, .intro-open, .circle-btn').forEach(function(btn) {
      btn.classList.add('fx-magnetic');
      btn.addEventListener('pointermove', function(e) {
        var r = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + 'px');
        btn.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px');
      });
      btn.addEventListener('pointerleave', function() {
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });
  }

  // ========================================================
  // CUENTA REGRESIVA: giro 3D cuando cambia un número
  // ========================================================
  function initCountdownFlip() {
    if (!('MutationObserver' in window)) return;
    document.querySelectorAll('.count-number').forEach(function(el) {
      var last = el.textContent;
      new MutationObserver(function() {
        if (el.textContent === last) return;
        last = el.textContent;
        el.classList.remove('fx-flip');
        void el.offsetWidth;
        el.classList.add('fx-flip');
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  // ========================================================
  // BARRA INFERIOR: resalta la sección visible
  // ========================================================
  function initBottomNav() {
    var nav = document.querySelector('.bottom-nav');
    if (!nav) return;
    var items = Array.prototype.slice.call(nav.querySelectorAll('.bottom-nav-item'));
    var sections = items.map(function(a) { return document.querySelector(a.getAttribute('href')); });
    var current = -1;
    var ticking = false;

    function update() {
      ticking = false;
      var line = window.innerHeight * 0.4;
      var idx = 0;
      sections.forEach(function(sec, i) {
        if (sec && sec.getBoundingClientRect().top <= line) idx = i;
      });
      if (idx === current) return;
      current = idx;
      nav.style.setProperty('--nav-index', idx);
      items.forEach(function(a, i) { a.classList.toggle('is-active', i === idx); });
    }

    window.addEventListener('scroll', function() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // ========================================================
  // INICIO
  // ========================================================
  function init() {
    initFrames();
    initButtons();
    initTilt();
    initCountdownFlip();
    initBottomNav();
    initScrollGlow();
    initIntro();
    Particles.start();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
