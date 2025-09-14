// vite.config.ts
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import monacoEditorPlugin from 'vite-plugin-monaco-editor-esm';

const TUNNEL_HOST = process.env.VITE_TUNNEL_HOST || 'maszynaw.loca.lt'; // ustaw w .env gdy używasz tunelu
const USE_TUNNEL = !!process.env.VITE_TUNNEL; // np. VITE_TUNNEL=1

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    monacoEditorPlugin({ languages: ['plaintext'] }),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
    hmr: USE_TUNNEL
      ? {
          protocol: 'wss',
          host: TUNNEL_HOST,
          port: 443,
          clientPort: 443,
          // path: '/hmr', // odkomentuj jeśli za proxy zmieniasz ścieżkę
          overlay: true, // ustaw false jeśli chcesz ukryć czerwony overlay błędów na stronie
        }
      : true, // lokalnie klasyczny HMR
    allowedHosts: 'all',
    proxy: {
      // 2) PROXY MUSI MIEĆ PROTOKÓŁ; jeśli endpoint wspiera WS, włącz ws: true
      '/api': {
        target: 'https://real-large-cricket.ngrok-free.app',
        changeOrigin: true,
        secure: true, // ngrok ma prawidłowy cert; dla self-signed daj false
        ws: true,     // jeżeli pod /api masz także WebSockety
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  optimizeDeps: {
    // UWAGA: optimizeDeps.include służy do paczek npm, nie do plików ze src.
    // Jeżeli to ścieżka lokalna – usuń, bo może powodować dziwne pre-bundle warnings.
    // include: ['@/workers/chat.worker.js'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
