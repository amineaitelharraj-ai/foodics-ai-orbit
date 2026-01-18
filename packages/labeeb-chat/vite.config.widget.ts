import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

/**
 * Widget build configuration
 *
 * This creates a standalone bundle that includes Vue and all dependencies,
 * suitable for embedding via script tag in any webpage.
 */
export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['widget/**/*.ts', 'src/**/*.ts', 'src/**/*.vue'],
      outDir: 'dist',
      staticImport: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, '../../shared'),
    },
  },
  define: {
    // Needed for standalone build
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'widget/index.ts'),
      name: 'LabeebWidget',
      fileName: 'labeeb-widget',
      formats: ['es', 'umd', 'iife'],
    },
    rollupOptions: {
      // For standalone widget, we bundle Vue
      external: [],
      output: {
        // Provide global variable names for externalized deps
        globals: {},
        // Ensure CSS is extracted
        assetFileNames: 'labeeb-widget.[ext]',
      },
    },
    // Output to dist folder
    outDir: 'dist/widget',
    sourcemap: true,
    minify: 'esbuild',
    // Don't empty the directory as main build might have run first
    emptyOutDir: false,
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
});
