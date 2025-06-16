# w

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```


## Platform Selection: Web / ESP32

This project supports conditional behavior depending on the target platform (e.g., web browser or ESP32 hardware).  
You can configure it using the `VITE_APP_PLATFORM` environment variable.

### Available options:
- `web` – for standard browser-based usage
- `esp` – for deployment targeting ESP32

### How to use:

1. Create one of the following `.env` files in the project root:

**`.env`**
```env
VITE_APP_PLATFORM=web
```

**`.env.esp`**
```env
VITE_APP_PLATFORM=esp
```

2. Then build or run with the selected mode:

```sh
npm run build                # for web version
npm run build:esp            # for ESP32 version

npm run dev                  # for development targeting browser
npm run dev:esp              # for development targeting ESP32
```
