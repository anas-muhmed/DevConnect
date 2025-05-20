import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180, // 👈 set a new port here
    proxy: {
      '/api': 'http://localhost:5000', // your backend server
    },
  },
});
