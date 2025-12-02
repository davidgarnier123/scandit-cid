import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@scandit/web-datacapture-core/build/js/*',
          dest: 'sdc-lib'
        },
        {
          src: 'node_modules/@scandit/web-datacapture-barcode/build/js/*',
          dest: 'sdc-lib'
        }
      ]
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'sdc-lib/**/*'],
      manifest: {
        name: 'Scandit Inventaire',
        short_name: 'Inventaire',
        description: 'Scanner de codes-barres pour inventaire',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // Augmenter la limite pour les fichiers WASM
        runtimeCaching: [
          {
            urlPattern: /sdc-lib\/.*\.wasm$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'scandit-wasm-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  }
})
