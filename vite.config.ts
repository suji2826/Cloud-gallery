import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyBX2LZkYNnJB_mFawfcEsodISy7j8uySV8';
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'cloudgallery-387880832940';
  const authDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`;
  const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`;
  const messagingSenderId = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '387880832940';
  const appId = process.env.VITE_FIREBASE_APP_ID || '1:387880832940:web:cloudgallery';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(firebaseApiKey),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(projectId),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(authDomain),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(storageBucket),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(messagingSenderId),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(appId),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
