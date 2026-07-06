import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        spaceTravel: resolve(__dirname, 'space-travel.html'),
        deepRehearsal: resolve(__dirname, 'deep-rehearsal.html'),
      },
    },
  },
});
