# Boda Deivis & Maynelim — 12 · 12 · 2026

Landing page de invitación al matrimonio de **Deivis Bonillo & Maynelim Fajardo**.

## Diseño

Estilo **romántico clásico-moderno** inspirado en invitación de boda con paleta *dusty blue*:
- Color primario: dusty blue `#6B8CAE` y deep `#4A6278`
- Color texto: navy `#2C3E50`
- Color fondo: cream `#FAFAF7` / `#F5F1EB`
- Color acento: champán `#C9B99A`
- Color flora: sage `#C5D5C5`

Tipografías:
- **Playfair Display** — serif para títulos y nombres
- **Great Vibes** — script para "and" y decorativos
- **Montserrat** — sans-serif para cuerpo de texto

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

1. **Hero** — Nombres "Deivis & Maynelim" + sello circular con monograma D|M + fecha
2. **Cuenta regresiva** — Días / Horas / Minutos / Segundos al 12-Dic-2026 5:00 PM
3. **Bienvenida** — Mensaje de los novios
4. **Historia** — Timeline con 5 hitos (primer encuentro → boda)
5. **Detalles** — Ceremonia + Recepción + dress code
6. **Galería** — Grid de 6 fotos (placeholder Unsplash, se reemplazan por fotos reales)
7. **RSVP** — Formulario completo de confirmación con confetti al enviar
8. **Regalos** — Luna de miel + lista + tarjeta
9. **Hashtags** — #DeivisYMaynelim2026 + variantes
10. **Footer** — Monograma, nombres, fecha y agradecimiento

## Personalización rápida

Edita `index.html` y busca los siguientes placeholders:

| Placeholder | Descripción |
|-------------|-------------|
| `Iglesia San Rafael Arcángel` | Nombre de la iglesia/lugar de la ceremonia |
| `Av. Principal #123, Caracas, Venezuela` | Dirección ceremonia |
| `Salón Jardín Real` | Nombre del salón de recepción |
| `Carretera Sur, Km 12, Caracas, Venezuela` | Dirección recepción |
| `Cuenta: 0102-XXXX-XX-XXXXXXXX` | Datos bancarios para regalos |
| Fotos Unsplash en `.gallery-item` | Reemplazar `background-image` por fotos reales |
| `WEDDING_DATE` en `scripts/main.js` | Fecha/hora del evento (default: 2026-12-12T17:00) |

## Deploy en Cloudflare Pages

```bash
npx wrangler@latest pages deploy . --project-name=boda-deivis-maynelim --branch=main --commit-dirty=true
```

O conecta el repositorio a GitHub y vincúlalo a Cloudflare Pages automáticamente.

---

Hecho con ♥ para Deivis & Maynelim · 12 · 12 · 2026
