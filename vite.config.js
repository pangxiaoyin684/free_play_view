import { defineConfig } from 'vite'
import uniPlugin from '@dcloudio/vite-plugin-uni'

const getPlugin = (p) => {
  if (typeof p === 'function') return p
  if (p && typeof p.default === 'function') return p.default
  if (p && p.default && typeof p.default.default === 'function') return p.default.default
  return p
}

const uni = getPlugin(uniPlugin)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
})
