import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 3000,
    // 移除 proxy 配置，直接连接后端
  },
  build: {
    target: 'esnext',
  },
});
