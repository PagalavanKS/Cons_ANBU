import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://anbu-printing-offset-consultancy.onrender.com', 
        changeOrigin: true,
        secure: false
      }
    }
  },
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    cssCodeSplit: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
