// vite-plugin-spa-fallback.ts
import type { Plugin } from 'vite';

export default function spaFallbackPlugin(): Plugin {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Check if request is for /signin/* and not a file
        if (req.url?.startsWith('/signin/') && !req.url.includes('.')) {
          // Rewrite to /signin/ to serve index.html
          req.url = '/signin/';
        }
        next();
      });
    },
  };
}