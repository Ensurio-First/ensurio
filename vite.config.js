import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Preferred port; Vite falls back automatically if it is taken.
    port: 5200,
    host: true,
    // Vite rejects requests whose Host header it doesn't recognise. Quick tunnels
    // arrive as *.trycloudflare.com, so allow that suffix for review sharing.
    allowedHosts: ['.trycloudflare.com', '.loca.lt', '.ngrok-free.app'],
  },
})
