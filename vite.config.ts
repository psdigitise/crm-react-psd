// // import { defineConfig } from 'vite';
// // import react from '@vitejs/plugin-react';

// // // https://vitejs.dev/config/

// // export default defineConfig({
// //   plugins: [react()],
// //   server: {
// //     host: '0.0.0.0', // accessible from any IP in the local network
// //     port: 5173       // optional: specify a port
// //   }
// // });


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/login/',
  server: {
    host: '0.0.0.0', // accessible from any IP in the local network
    // port: 3000,      // optional: specify a port
    proxy: {
      '/api': {
        target: 'https://api.erpnext.ai',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
});


// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import spaFallbackPlugin from './vite-plugin-spa-fallback';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react(), spaFallbackPlugin()],
//   base: '/signin/',      
//   server: {
//     host: '0.0.0.0',
//     port: 5173,
//     proxy: {
//       '/api': {
//         target: 'https://api.erpnext.ai',
//         changeOrigin: true,
//         rewrite: path => path.replace(/^\/api/, '')
//       }
//     }
//   },
//   preview: {
//     port: 3000,
//     host: '0.0.0.0'
//   }
// });