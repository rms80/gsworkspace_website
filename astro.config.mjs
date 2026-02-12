// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  server: {
    port: 4555,
  },
  vite: {
    optimizeDeps: {
      exclude: ['axobject-query'],
    },
    ssr: {
      noExternal: ['axobject-query'],
    },
  },
});
