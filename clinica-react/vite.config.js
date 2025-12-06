import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ⬇️ AÑADE ESTE BLOQUE ⬇️
  server: {
    port: 5173,       // Fija el puerto a 5173
    strictPort: true, // Obliga a usar este puerto y falla si está ocupado
  },
  // ⬆️ FIN DEL BLOQUE ⬆️
})