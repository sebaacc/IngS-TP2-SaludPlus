import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages sirve el sitio en /IngS-TP2-SaludPlus/
  base: '/IngS-TP2-SaludPlus/',
})
