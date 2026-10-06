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
    if (!form) return;

    const feedback = document.getElementById('form-feedback');
    const acompanantesRow = document.getElementById('acompanantes-row');
    const radios = form.querySelectorAll('input[name="asistencia"]');
    const modal = document.getElementById('rsvp-modal');
    const summary = document.getElementById('rsvp-summary');
    const confirmBtn = document.getElementById('rsvp-confirm');
    let pending = null; // datos validados esperando confirmación

    // Mostrar acompañantes/menú solo si asistirá
    function toggleAcompanantes() {
      const si = form.querySelector('input[name="asistencia"][value="si"]').checked;
      acompanantesRow.style.display = si ? '' : 'none';
    }

    radios.forEach(function(radio) {
      radio.addEventListener('change', function() {
        toggleAcompanantes();
        clearError(form.querySelector('.radio-group'));
      });
    });

    // Quitar el error de un campo en cuanto el invitado lo corrige
    ['nombre', 'email', 'telefono'].forEach(function(name) {
      form[name].addEventListener('input', function() { clearError(form[name]); });
    });

    // ------------------------------------------------------
    // Validación con mensajes bajo cada campo
    // ------------------------------------------------------
    function setError(field, msg) {
      const group = field.closest('.form-group');
      group.classList.add('has-error');
      field.setAttribute('aria-invalid', 'true');
      let note = group.querySelector('.field-error');
      if (!note) {
        note = document.createElement('p');
        note.className = 'field-error';
        note.id = (field.id || 'asistencia') + '-error';
        group.appendChild(note);
      }
      note.textContent = msg;
      field.setAttribute('aria-describedby', note.id);
    }

    function clearError(field) {
      const group = field.closest('.form-group');
      if (!group || !group.classList.contains('has-error')) return;
      group.classList.remove('has-error');
      field.removeAttribute('aria-invalid');
      const note = group.querySelector('.field-error');
      if (note) note.remove();
    }

    function validate() {
      const errors = [];
      const nombre = form.nombre.value.trim().replace(/\s+/g, ' ');
      const email = form.email.value.trim();
      const telefono = form.telefono.value.trim();
      const asistencia = form.querySelector('input[name="asistencia"]:checked');

      [form.nombre, form.email, form.telefono, form.querySelector('.radio-group')].forEach(clearError);

      if (nombre.length < 3) {
        errors.push([form.nombre, 'Escribe tu nombre completo.']);
      } else if (nombre.split(' ').length < 2) {
        errors.push([form.nombre, 'Incluye tu nombre y apellido.']);
      }
      if (!isValidEmail(email)) {
        errors.push([form.email, 'Ingresa un correo válido, por ejemplo: nombre@correo.com']);
      }
      if (telefono && telefono.replace(/\D/g, '').length < 7) {
        errors.push([form.telefono, 'El teléfono parece incompleto.']);
      }
      if (!asistencia) {
        errors.push([form.querySelector('.radio-group'), 'Cuéntanos si podrás asistir.']);
      }

      errors.forEach(function(err) { setError(err[0], err[1]); });

      if (errors.length) {
        const first = errors[0][0];
        first.closest('.form-group').scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusable = first.matches('input, select, textarea') ? first : first.querySelector('input');
        if (focusable) setTimeout(function() { focusable.focus({ preventScroll: true }); }, 350);
        showFeedback(errors.length === 1
          ? 'Revisa el campo marcado, por favor.'
          : 'Revisa los ' + errors.length + ' campos marcados, por favor.', true);
        return null;
      }

      const si = asistencia.value === 'si';
      return {
        nombre: nombre,
        email: email,
        telefono: telefono,
        asistencia: asistencia.value,
        acompanantes: si ? form.acompanantes.value : '0',
        acompanantesTexto: si ? form.acompanantes.selectedOptions[0].text : '',
        menu: si ? form.menu.value : '',
        menuTexto: si ? form.menu.selectedOptions[0].text : '',
        cancion: form.cancion.value.trim(),
        mensaje: form.mensaje.value.trim()
      };
    }

    // ------------------------------------------------------
    // Modal: resumen → confirmar → gracias
    // ------------------------------------------------------
    function fillSummary(data) {
      const rows = [
        ['Nombre', data.nombre],
        ['Correo', data.email],
        ['Teléfono', data.telefono],
        ['Asistencia', data.asistencia === 'si' ? '¡Sí, ahí estaré! 😊' : 'No podré asistir 😢'],
        ['Acompañantes', data.acompanantesTexto],
        ['Menú', data.menuTexto],
        ['Canción', data.cancion],
        ['Mensaje', data.mensaje]
      ];
      summary.textContent = '';
      rows.forEach(function(row) {
        if (!row[1]) return;
        const wrap = document.createElement('div');
        wrap.className = 'rsvp-summary-row';
        const dt = document.createElement('dt');
        dt.textContent = row[0];
        const dd = document.createElement('dd');
        dd.textContent = row[1];
        if (row[0] === 'Asistencia') dd.className = data.asistencia === 'si' ? 'is-yes' : 'is-no';
        wrap.appendChild(dt);
        wrap.appendChild(dd);
        summary.appendChild(wrap);
      });
    }

    function showStep(step) {
      modal.querySelectorAll('.rsvp-step').forEach(function(el) {
        el.hidden = el.dataset.step !== step;
      });
      modal.dataset.step = step;
    }

    function openModal() {
      showStep('review');
      if (typeof modal.showModal === 'function') modal.showModal();
      else modal.setAttribute('open', '');
      document.documentElement.classList.add('modal-open');
      setTimeout(function() { confirmBtn.focus(); }, 50);
    }

    function closeModal() {
      modal.classList.add('is-closing');
      setTimeout(function() {
        modal.classList.remove('is-closing');
        if (typeof modal.close === 'function' && modal.open) modal.close();
        else modal.removeAttribute('open');
      }, 250);
    }

    modal.addEventListener('close', function() {
      document.documentElement.classList.remove('modal-open');
      if (modal.dataset.step === 'review') form.nombre.focus({ preventScroll: true });
    });

    // Cerrar con botones o tocando fuera de la tarjeta
    modal.addEventListener('click', function(e) {
      if (e.target.closest('[data-modal-close]') || e.target === modal) closeModal();
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const data = validate();
      if (!data) return;
      feedback.classList.remove('show');
      pending = data;
      fillSummary(data);
      openModal();
    });

    confirmBtn.addEventListener('click', function() {
      if (!pending) return;
      const data = pending;
      pending = null;
      data.timestamp = new Date().toISOString();

      // Guardar en localStorage como respaldo
      try {
        const rsvps = JSON.parse(localStorage.getItem('rsvps') || '[]');
        rsvps.push(data);
        localStorage.setItem('rsvps', JSON.stringify(rsvps));
      } catch (err) {}

      // Enviar a Google Sheet vía Formspree-style (placeholder)
      console.log('RSVP:', data);

      const primerNombre = data.nombre.split(' ')[0];
      const si = data.asistencia === 'si';
      document.getElementById('rsvp-success-title').textContent =
        si ? '¡Gracias, ' + primerNombre + '!' : 'Gracias, ' + primerNombre;
      document.getElementById('rsvp-success-text').textContent = si
        ? 'Nos emociona saber que estarás con nosotros. ¡Te esperamos! ♥'
        : 'Gracias por avisarnos. Te extrañaremos en este día tan especial. ♥';

      showStep('success');
      showFeedback(si
        ? '¡Asistencia confirmada! Te esperamos el 12 de Diciembre. ♥'
        : 'Gracias por avisarnos, ' + primerNombre + '. ♥', false, true);
      form.reset();
      toggleAcompanantes();
      if (si) launchConfetti();
    });

    function showFeedback(msg, isError, quiet) {
      feedback.textContent = msg;
      feedback.classList.add('show');
      feedback.classList.toggle('error', isError);
      if (!isError && !quiet) feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (!isError) {
        setTimeout(function() { feedback.classList.remove('show'); }, 8000);
      }
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    }
  }

  // ========================================================
  // CONFETTI BÁSICO
  // ========================================================
  function launchConfetti() {
    const colors = ['#6E8DB0', '#3F5A78', '#F7E7A6', '#FBEFC4', '#E8C878', '#C9A352'];
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
    // Si el modal está abierto, el confeti va dentro para verse por encima
    const modal = document.getElementById('rsvp-modal');
    (modal && modal.open ? modal : document.body).appendChild(container);

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
