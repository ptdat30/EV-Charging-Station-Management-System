// vite.config.js - Optimized for bundle size and performance
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
        sourcemap: false, // Disable source maps in production for smaller bundle
        rollupOptions: {
            output: {
                manualChunks: {
                    // Separate vendor chunks for better caching
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'charts-vendor': ['recharts'],
                    'leaflet-vendor': ['leaflet', 'react-leaflet'],
                    'utils-vendor': ['axios']
                },
                // Optimize chunk names
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
            }
        },
        // Enable minification
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // Remove console logs in production
                drop_debugger: true
            }
        },
        // Optimize chunk size warning
        chunkSizeWarningLimit: 1000
    },
    // Optimize dependencies
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
        exclude: ['@testing-library/react']
    }
})