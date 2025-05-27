import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/frontend/', 
  server: {
    host: '0.0.0.0',
    port: 80,
    hmr: {
      clientPort: 8080,
    },
    proxy: {
      '/api/users': {
        target: 'http://backend:3000/users',
        changeOrigin: true,
      },
      '/api/auth/login': {
        target: 'http://backend:3000/auth/login',
        changeOrigin: true,
      },
      '/api/auth/profile': { 
        target: 'http://backend:3000/auth/profile',
        changeOrigin: true,
      },
      '/api/transactions': { 
        target: 'http://backend:3000/transactions',
        changeOrigin: true,
      },
      '/api/categories': { 
        target: 'http://backend:3000/categories',
        changeOrigin: true,
      },
      '/api/dashboard/summary': { 
        target: 'http://backend:3000/dashboard/summary',
        changeOrigin: true,
      },
      '/api/budgets': { 
        target: 'http://backend:3000/budgets',
        changeOrigin: true,
      },
      '/api/dashboard/expenses-by-category': {
        target: 'http://backend:3000/dashboard/expenses-by-category',
        changeOrigin: true,
      }
    },
  },
});

