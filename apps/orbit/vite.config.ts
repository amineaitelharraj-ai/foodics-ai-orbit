import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@foodics/labeeb-chat': resolve(__dirname, '../../packages/labeeb-chat/src'),
      '@shared': resolve(__dirname, '../../shared'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    sourcemap: true,
  },
});
