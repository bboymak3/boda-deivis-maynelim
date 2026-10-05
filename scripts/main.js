/* ============================================================
   BODA DEIVIS & MAYNELIM — JavaScript
   ============================================================ */
(function() {
  'use strict';

  // ========================================================
  // FECHA DEL MATRIMONIO — Editable
  // Sábado, 12 de Diciembre de 2026, 5:00 PM (17:00)
  // ========================================================
  const WEDDING_DATE = new Date('2026-12-12T17:00:00-04:00'); // Hora Venezuela (UTC-4)

  // ========================================================
  // COUNTDOWN
  // ========================================================
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = WEDDING_DATE.getTime() - now;

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl) return;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      const countdownSection = document.getElementById('countdown');
      if (countdownSection) {
        const pretitle = countdownSection.querySelector('.section-pretitle');
        const title = countdownSection.querySelector('.script-title');
        if (pretitle) pretitle.textContent = 'Hoy es';
        if (title) title.textContent = '¡Nuestro gran día!';
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  // ========================================================
  // RSVP FORM
  // ========================================================
  function initRSVPForm() {
    const form = document.getElementById('rsvp-form');
    const feedback = document.getElementById('form-feedback');
    const acompanantesRow = document.getElementById('acompanantes-row');
    const radioSi = form?.querySelector('input[name="asistencia"][value="si"]');
    const radioNo = form?.querySelector('input[name="asistencia"][value="no"]');

    if (!form) return;

    // Mostrar/ocultar acompañantes según respuesta
    function toggleAcompanantes() {
      if (radioSi.checked) {
        acompanantesRow.style.display = '';
      } else if (radioNo.checked) {
        acompanantesRow.style.display = 'none';
      } else {
        acompanantesRow.style.display = 'none';
      }
    }

    form.querySelectorAll('input[name="asistencia"]').forEach(function(radio) {
      radio.addEventListener('change', toggleAcompanantes);
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Validación simple
      const nombre = form.nombre.value.trim();
      const email = form.email.value.trim();
      const asistencia = form.querySelector('input[name="asistencia"]:checked');

      if (!nombre) {
        showFeedback('Por favor escribe tu nombre.', true);
        form.nombre.focus();
        return;
      }

      if (!email || !isValidEmail(email)) {
        showFeedback('Por favor ingresa un correo electrónico válido.', true);
        form.email.focus();
        return;
      }

      if (!asistencia) {
        showFeedback('Por favor confirma si asistirás.', true);
        return;
      }

      // Recoger datos
      const data = {
        nombre: nombre,
        email: email,
        telefono: form.telefono.value.trim(),
        asistencia: asistencia.value,
        acompanantes: form.acompanantes ? form.acompanantes.value : '0',
        menu: form.menu ? form.menu.value : '',
        cancion: form.cancion.value.trim(),
        mensaje: form.mensaje.value.trim(),
        timestamp: new Date().toISOString()
      };

      // Guardar en localStorage como respaldo
      try {
        const rsvps = JSON.parse(localStorage.getItem('rsvps') || '[]');
        rsvps.push(data);
        localStorage.setItem('rsvps', JSON.stringify(rsvps));
      } catch (err) {}

      // Enviar a Google Sheet vía Formspree-style (placeholder)
      console.log('RSVP:', data);

      // Mensaje de éxito
      const mensaje = asistencia.value === 'si'
        ? '¡Gracias ' + nombre.split(' ')[0] + '! Nos emociona saber que estarás ahí. Te esperamos el 12 de Diciembre. ♥'
        : 'Gracias ' + nombre.split(' ')[0] + ' por avisarnos. Te extrañaremos en este día tan especial. ♥';

      showFeedback(mensaje, false);
      form.reset();
      acompanantesRow.style.display = 'none';

      // Confetti simple
      launchConfetti();
    });

    function showFeedback(msg, isError) {
      feedback.textContent = msg;
      feedback.classList.add('show');
      feedback.classList.toggle('error', isError);
      feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });

      if (!isError) {
        setTimeout(function() {
          feedback.classList.remove('show');
        }, 8000);
      }
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
  }

  // ========================================================
  // CONFETTI BÁSICO
  // ========================================================
  function launchConfetti() {
    const colors = ['#6B8CAE', '#C9B99A', '#C5D5C5', '#A7C0D6', '#E6DCC7'];
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(container);

    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      const size = Math.random() * 8 + 4;
      const left = Math.random() * 100;
      const delay = Math.random() * 0.5;
      const duration = Math.random() * 2 + 2.5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const isCircle = Math.random() > 0.5;

      piece.style.cssText =
        'position:absolute;' +
        'left:' + left + '%;' +
        'top:-20px;' +
        'width:' + size + 'px;' +
        'height:' + size + 'px;' +
        'background:' + color + ';' +
        'border-radius:' + (isCircle ? '50%' : '2px') + ';' +
        'opacity:0.8;' +
        'animation: confettiFall ' + duration + 's ease-in ' + delay + 's forwards;';

      container.appendChild(piece);
    }

    // Animación keyframes inyectados
    const style = document.createElement('style');
    style.textContent =
      '@keyframes confettiFall {' +
      '0% { transform: translateY(0) rotate(0deg); opacity: 1; }' +
      '100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }' +
      '}';
    document.head.appendChild(style);

    setTimeout(function() {
      container.remove();
      style.remove();
    }, 5500);
  }

  // ========================================================
  // SCROLL REVEAL (Intersection Observer)
  // ========================================================
  function initScrollReveal() {
    // Añadir clase js-enabled al <html> inmediatamente
    document.documentElement.classList.add('js-enabled');

    const targets = document.querySelectorAll(
      '.section-pretitle, .section-title, .script-title, .timeline-item, .details-card, .gallery-item, .gift-card, .hashtag, .welcome-text, .rsvp-form, .countdown, .dress-code'
    );

    targets.forEach(function(el, idx) {
      el.classList.add('reveal');
      // Pequeño stagger por grupo
      el.style.transitionDelay = (idx % 4) * 80 + 'ms';
    });

    // Fallback: revelar todo después de 2s (por si observer no dispara)
    setTimeout(function() {
      targets.forEach(function(el) { el.classList.add('visible'); });
    }, 2000);

    if (!('IntersectionObserver' in window)) {
      // Fallback: mostrar todo
      targets.forEach(function(el) { el.classList.add('visible'); });
      return;
    }

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -10px 0px'
    });

    targets.forEach(function(el) { observer.observe(el); });
  }

  // ========================================================
  // SMOOTH SCROLL para enlaces internos
  // ========================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href.length < 2) return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ========================================================
  // INICIALIZACIÓN
  // ========================================================
  document.addEventListener('DOMContentLoaded', function() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
    initRSVPForm();
    initScrollReveal();
    initSmoothScroll();
  });

})();
