import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        // 配置别名路径，快速访问
        '@': path.resolve(__dirname, 'src'),
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 全局公用样式
          additionalData: '@import "@/assets/styles/main.scss";',
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      open: true,
      // 开发环境启动的端口
      proxy: {
        [process.env.VITE_BASE_URL]: {
          target: 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(process.env.VITE_BASE_URL, ''),
        }
      },
      cors: true,
    },

  }
})
