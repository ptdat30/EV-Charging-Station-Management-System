// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5181,
        host: true,
        strictPort: true,
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
                // 🛑 QUAN TRỌNG: ĐÃ BỎ HÀM REWRITE ĐỂ BACKEND XỬ LÝ /api/
                // Yêu cầu: http://localhost:5181/api/...  -> http://localhost:8080/api/...
            }
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: true
    }
})