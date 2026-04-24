import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This tells Vite: Anytime the app asks for "/video_feed", 
      // secretly fetch it from the Raspberry Pi instead.
      '/video_feed': {
        target: 'http://172.20.10.2:5000/', // e.g., http://192.168.1.15:8080
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/video_feed/, '')
      }
    }
  }
})