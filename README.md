# Boda Deivis & Maynelim — 12 · 12 · 2026

Landing page de invitación al matrimonio de **Deivis Bonillo & Maynelim Fajardo**.

## Diseño

Estilo **romántico clásico-moderno** inspirado en una invitación de referencia.
**El azul domina y el amarillo pastel es el segundo color**, con acentos dorados:
- Azules: `#2A4060` (noche) · `#3F5A78` (profundo) · `#6E8DB0` (dusty blue) · `#C9D9EA` · `#EEF3F9`
- Amarillo pastel: `#F7E7A6` · `#FBEFC4` · `#FDF6D8`
- Dorado: `#C9A352` / `#E8C878` (bordes animados, sello, números)

Ritmo de secciones: azul claro (inicio) → azul profundo (cuenta regresiva) →
amarillo pastel (bienvenida) → azul claro (detalles) → amarillo (galería) →
azul profundo (RSVP) → azul (versículo, regalos) → azul noche (footer). Todo esto vive en `styles/tema.css`.

Tipografías:
- **Playfair Display** — serif para títulos y nombres
- **Great Vibes** — script para "and" y decorativos
- **Montserrat** — sans-serif para cuerpo de texto

## Capa de animación (v2)

Rediseño inspirado en una invitación de referencia (dusty blue + crema + dorado):

- **Sobre 3D de bienvenida** con sello de cera D|M: al tocar "Abrir invitación" la
  solapa se abre, sale la carta, estallan destellos dorados y empieza la música.
- **Tarjeta de invitación** con foto, sello de cera, nombres en 3D y 4 botones
  circulares animados (Ver lugar · Confirmar asistencia · Nuestra galería · Regalos).
- **Bordes dorados vivos** en todas las tarjetas: el brillo gira solo y además
  avanza y se intensifica al desplazar la página; destello diagonal cada vez que
  una tarjeta entra en pantalla.
- **Botones animados**: brillo recorriendo, onda dorada al tocar, efecto magnético.
- **Partículas doradas** con profundidad (parallax) y rastro de destellos con el mouse.
- **Inclinación 3D** de tarjetas con el mouse (y de la invitación con el giroscopio en Android).
- **Barra inferior tipo app** que resalta la sección visible.
- **Música de fondo** — ver `assets/musica/LEEME.md`.
- **Modal de confirmación RSVP**: valida cada campo (mensaje bajo el campo con error),
  muestra un resumen para revisar (Editar / Sí, confirmar) y luego una pantalla de
  agradecimiento con check animado y confeti.
- **Confirmaciones por WhatsApp**: al confirmar se abre WhatsApp con la respuesta
  lista para enviar al número `WHATSAPP_NUMBER` de `scripts/main.js` (+58 414-9851063).
- Respeta "reducir movimiento" del sistema.

Archivos: `styles/invitacion.css`, `styles/effects.css`, `styles/tema.css`, `scripts/effects.js`.

> Al cambiar CSS/JS sube el número `?v=` en los `<link>`/`<script>` de los HTML:
> `_headers` guarda esos archivos en caché por un año.

## Estructura

```
boda-deivis-maynelim/
├── index.html              # Página principal con todas las secciones
├── styles/
│   └── main.css            # Estilos (paleta dusty blue + tipografías)
├── scripts/
│   └── main.js             # Countdown, RSVP, scroll reveal
├── assets/
│   └── favicon.svg         # Favicon con monograma D|M
├── _headers                # Config Cloudflare Pages
└── README.md
```

## Secciones

1. **Hero** — Tarjeta de invitación: foto, sello D|M, nombres, fecha y 4 botones circulares
2. **Cuenta regresiva** — Días / Horas / Minutos / Segundos al 12-Dic-2026 5:00 PM
3. **Bienvenida** — Mensaje de los novios
4. **Detalles** — Ceremonia + Recepción + dress code
5. **Galería** — Grid de 6 fotos (placeholder Unsplash, se reemplazan por fotos reales)
6. **RSVP** — Formulario completo de confirmación con confetti al enviar
7. **Regalos** — USDT (Binance) como opción preferida con botón Copiar + Pago Móvil
8. **Footer** — Monograma, nombres, fecha y agradecimiento

## Personalización rápida

Edita `index.html` y busca los siguientes placeholders:

| Placeholder | Descripción |
|-------------|-------------|
| `Iglesia San Rafael Arcángel` | Nombre de la iglesia/lugar de la ceremonia |
| `Av. Principal #123, Caracas, Venezuela` | Dirección ceremonia |
| `Salón Jardín Real` | Nombre del salón de recepción |
| `Carretera Sur, Km 12, Caracas, Venezuela` | Dirección recepción |
| `Cuenta: 0102-XXXX-XX-XXXXXXXX` | Datos bancarios para regalos |
| Foto en `.invite-photo img` (index.html) | Foto principal de los novios en la tarjeta |
| `assets/musica/cancion.mp3` | Canción de fondo |
| Fotos Unsplash en `.gallery-item` | Reemplazar `background-image` por fotos reales |
| `WEDDING_DATE` en `scripts/main.js` | Fecha/hora del evento (default: 2026-12-12T17:00) |

## Deploy en Cloudflare Pages

```bash
npx wrangler@latest pages deploy . --project-name=boda-deivis-maynelim --branch=main --commit-dirty=true
```

O conecta el repositorio a GitHub y vincúlalo a Cloudflare Pages automáticamente.

---

Hecho con ♥ para Deivis & Maynelim · 12 · 12 · 2026
