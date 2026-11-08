# Música de fondo

Canción actual: **"Hasta Ese Día" — Lasso**, en dos versiones:

| Archivo | Formato | Peso | Quién la usa |
|---|---|---|---|
| `hasta-ese-dia.webm` | Opus 96 kbps | 2,9 MB | Chrome, Android, Firefox, Edge y Safari reciente |
| `hasta-ese-dia.m4a` | AAC 128 kbps (original) | 3,7 MB | iPhones/Safari que no reproducen Opus |

El navegador elige sola la primera que puede reproducir. Opus a 96 kbps suena
igual o mejor que AAC a 128 kbps (mismo volumen, mismo rango dinámico y
agudos completos), con un 21 % menos de peso.

- La canción **no se descarga al abrir la página**: solo cuando va a sonar
  (`preload="metadata"`), y se va reproduciendo mientras se descarga.
- Al entrar intenta sonar sola. La mayoría de los celulares no dejan sonar
  audio hasta que la persona toca la pantalla, así que en ese caso empieza con
  el primer toque (por ejemplo al tocar **"Abrir invitación"** en el sobre).
- El reproductor flotante (arriba a la derecha) tiene: empezar de nuevo,
  reproducir/pausar, bajar y subir volumen. El volumen elegido se recuerda.
- Se pausa al salir de la pestaña y sigue al volver.

Para cambiar la canción: genera las dos versiones **con otro nombre** (los
archivos de `/assets/` se guardan en caché por un año) y actualiza las dos
etiquetas `<source>` del `<audio id="bg-music">` en `index.html`:

```bash
ffmpeg -i original.m4a -map 0:a -c:a copy -map_metadata -1 -movflags +faststart nueva.m4a
ffmpeg -i nueva.m4a -map 0:a -c:a libopus -b:a 96k -vbr on -compression_level 10 -application audio -map_metadata -1 nueva.webm
```
