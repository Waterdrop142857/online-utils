import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载所有环境变量，包括系统环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    base: env.VITE_BASE || '/',
    plugins: [vue()],
  }
})
