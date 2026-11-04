import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 상대 경로 빌드: novlive.com/youngggl/ 과 앱(Capacitor) 루트에서 모두 동작
  base: './',
  plugins: [react()],
})
