// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: '0.0.0.0', // accessible from any IP in the local network
//     port: 5173       // optional: specify a port
//   }
// });


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // accessible from any IP in the local network
    // port: 3000,      // optional: specify a port
    proxy: {
      '/api': {
        target: 'http://103.214.132.20:8002',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
});
