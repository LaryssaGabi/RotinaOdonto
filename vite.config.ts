import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
   assetsInclude: ['**/*.ttf'],
   build: {
    assetsInlineLimit: 4096,
   },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
