import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://anbu-printing-offset-consultancy.onrender.com', 
        // Your Express server URL
        changeOrigin: true,
        secure: false
      }
    }
  }
})
