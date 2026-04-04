# BotExample

Ejemplo local para probar `discord-html-transcripts-v2` con un bot real.

Este script:

- inicia sesion con tu token
- busca un servidor
- localiza una categoria por `CATEGORY_ID` o `CATEGORY_NAME`
- elige un canal de texto aleatorio dentro de esa categoria
- genera el transcript en `BotExample/output/`
- opcionalmente envia el HTML al mismo canal

## Uso

1. Copia `BotExample/.env.example` a `BotExample/.env`
2. Completa las variables
3. Ejecuta:

```bash
pnpm bot:example
```

## Variables

- `BOT_TOKEN`: token del bot
- `GUILD_ID`: id del servidor. Si lo omites, solo funciona si el bot esta en un unico servidor
- `CATEGORY_ID`: id de la categoria objetivo
- `CATEGORY_NAME`: nombre de la categoria objetivo si no usas id
- `MESSAGE_LIMIT`: cantidad maxima de mensajes. Usa `-1` para todo el historial
- `SAVE_IMAGES`: `true` o `false`
- `SEND_TO_SOURCE_CHANNEL`: `true` para enviar el archivo al canal elegido
- `OUTPUT_DIR`: carpeta de salida. Por defecto `./output`

## Notas

- `BotExample/.env` queda ignorado por git.
- `CATEGORY_ID` tiene prioridad sobre `CATEGORY_NAME`.
- El bot necesita permisos para ver el canal, leer historial y, si activas envio, adjuntar archivos.
