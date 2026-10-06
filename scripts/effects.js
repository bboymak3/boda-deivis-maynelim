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
  // MÚSICA: archivo propio o Canon de Pachelbel sintetizado
  // ========================================================
  var Music = (function() {
    var audio = document.getElementById('bg-music');
    var button = document.getElementById('music-toggle');
    if (!audio || !button) return { start: function() {} };

    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    var actx = null;
    var mode = null;      // 'file' | 'synth'
    var playing = false;
    var wantPlaying = false;
    var synth = null;

    function ensureContext() {
      if (!actx && AudioCtx) actx = new AudioCtx();
      if (actx && actx.state === 'suspended') actx.resume();
    }

    function setPlaying(state) {
      playing = state;
      button.classList.toggle('is-playing', state);
      button.setAttribute('aria-pressed', String(state));
      button.setAttribute('aria-label', state ? 'Pausar música' : 'Reproducir música');
    }

    function fadeInFile() {
      audio.volume = 0;
      var v = 0;
      var id = setInterval(function() {
        v = Math.min(0.7, v + 0.05);
        audio.volume = v;
        if (v >= 0.7) clearInterval(id);
      }, 120);
    }

    function startSynth() {
      ensureContext();
      if (!actx) return;
      if (!synth) synth = createCanon(actx);
      synth.play();
      mode = 'synth';
      setPlaying(true);
    }

    // Debe llamarse desde un clic/toque (los navegadores bloquean el autoplay)
    function start() {
      wantPlaying = true;
      ensureContext(); // desbloquea el audio dentro del gesto del usuario
      if (mode === 'synth') { startSynth(); return; }
      var p = audio.play();
      if (p && p.then) {
        p.then(function() {
          mode = 'file';
          fadeInFile();
          setPlaying(true);
        }).catch(startSynth); // sin archivo → melodía generada
      } else {
        mode = 'file';
        setPlaying(true);
      }
    }

    function pause() {
      wantPlaying = false;
      if (mode === 'file') audio.pause();
      if (mode === 'synth' && synth) synth.pause();
      setPlaying(false);
    }

    audio.addEventListener('error', function() {
      if (wantPlaying && mode !== 'synth') startSynth();
    });

    button.addEventListener('click', function() {
      if (playing) pause();
      else start();
    });

    // Pausar al salir de la pestaña y reanudar al volver
    document.addEventListener('visibilitychange', function() {
      if (!wantPlaying) return;
      if (document.hidden) {
        if (mode === 'file') audio.pause();
        if (mode === 'synth' && synth) synth.pause();
      } else {
        if (mode === 'file') audio.play().catch(function() {});
        if (mode === 'synth' && synth) synth.play();
      }
    });

    return { start: start };
  })();

  // Canon en Re de Pachelbel (dominio público) como caja de música
  function createCanon(actx) {
    var master = actx.createGain();
    master.gain.value = 0;
    master.connect(actx.destination);

    // Reverberación suave generada (sala de iglesia)
    var reverb = actx.createConvolver();
    var len = Math.floor(actx.sampleRate * 3);
    var impulse = actx.createBuffer(2, len, actx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var data = impulse.getChannelData(ch);
      for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    reverb.buffer = impulse;
    var wet = actx.createGain();
    wet.gain.value = 0.45;
    reverb.connect(wet);
    wet.connect(master);

    function freq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

    function note(midi, t, dur, vol, type, bell) {
      var osc = actx.createOscillator();
      var g = actx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq(midi);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      g.connect(master);
      g.connect(reverb);
      osc.start(t);
      osc.stop(t + dur + 0.05);
      if (bell) { // armónico brillante tipo caja de música
        var o2 = actx.createOscillator();
        var g2 = actx.createGain();
        o2.frequency.value = freq(midi) * 4;
        g2.gain.setValueAtTime(0.0001, t);
        g2.gain.exponentialRampToValueAtTime(vol * 0.18, t + 0.01);
        g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.4);
        o2.connect(g2);
        g2.connect(master);
        g2.connect(reverb);
        o2.start(t);
        o2.stop(t + dur);
      }
    }

    var BEAT = 0.75;                      // 80 bpm
    var BASS = [50, 45, 47, 42, 43, 38, 43, 45];               // D A Bm F#m G D G A
    var CHORDS = [[62, 66, 69], [61, 64, 69], [62, 66, 71], [61, 66, 69],
                  [62, 67, 71], [62, 66, 69], [62, 67, 71], [61, 64, 69]];
    var MELODIES = [
      null,
      [[78], [76], [74], [73], [71], [69], [71], [73]],
      [[74], [73], [71], [69], [67], [66], [67], [64]],
      [[74, 78], [81, 79], [78, 74], [78, 76], [74, 71], [74, 69], [67, 71], [69, 67]]
    ];

    var step = 0;
    var nextTime = 0;
    var timer = null;

    function scheduleChord(s, t) {
      var c = s % 8;
      var cycle = Math.floor(s / 8);
      var section = cycle === 0 ? 0 : 1 + ((cycle - 1) % 3);
      note(BASS[c], t, BEAT * 2.2, 0.16, 'sine');
      note(BASS[c] + 12, t, BEAT * 1.6, 0.05, 'triangle');
      var arp = [0, 1, 2, 1];
      for (var a = 0; a < 4; a++) {
        note(CHORDS[c][arp[a]] + (a === 2 ? 12 : 0), t + a * BEAT / 2, 0.9, 0.045, 'triangle');
      }
      var mel = MELODIES[section];
      if (mel) {
        var notes = mel[c];
        var each = (BEAT * 2) / notes.length;
        for (var n = 0; n < notes.length; n++) {
          note(notes[n], t + n * each, 1.8, 0.11, 'sine', true);
        }
      }
    }

    function tick() {
      while (nextTime < actx.currentTime + 0.6) {
        scheduleChord(step, nextTime);
        nextTime += BEAT * 2;
        step++;
      }
    }

    return {
      play: function() {
        if (actx.state === 'suspended') actx.resume();
        if (!timer) {
          if (nextTime < actx.currentTime) nextTime = actx.currentTime + 0.1;
          timer = setInterval(tick, 80);
          tick();
        }
        master.gain.cancelScheduledValues(actx.currentTime);
        master.gain.setTargetAtTime(0.55, actx.currentTime, 0.6);
      },
      pause: function() {
        master.gain.cancelScheduledValues(actx.currentTime);
        master.gain.setTargetAtTime(0, actx.currentTime, 0.15);
        clearInterval(timer);
        timer = null;
      }
    };
  }

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
    var buttons = document.querySelectorAll('.btn-submit, .btn-gallery, .intro-open, .copy-btn, .back-link');
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
    document.querySelectorAll('.btn-gallery, .intro-open, .music-toggle, .circle-btn').forEach(function(btn) {
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
