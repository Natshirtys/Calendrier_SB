import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: {
      '/api/concours': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        rewrite: () => '/spreadsheets/d/1e7Nszu_QLC3a8JepEEjQafPYTwcpxMah/gviz/tq?tqx=out:csv&gid=0',
      },
      '/api/couleurs': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        rewrite: () => '/spreadsheets/d/1e7Nszu_QLC3a8JepEEjQafPYTwcpxMah/gviz/tq?tqx=out:csv&sheet=Couleurs',
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Concours Boules Lyonnaises',
        short_name: 'Boules',
        description: 'Calendrier des concours de boules lyonnaises',
        theme_color: '#1a5276',
        background_color: '#f5f6fa',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
      },
    }),
  ],
})
