import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  base: '/salon_app/',
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Centre de Beauté Zara',
        short_name: 'Zara Beauté',
        description: 'Réservez votre séance de beauté au Centre Zara : tresses, soins capillaires et manucure.',
        id: 'zara-client-app',
        theme_color: '#1877f2',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['beauty', 'lifestyle'],
        shortcuts: [
          {
            name: "Admin",
            short_name: "Admin",
            description: "Tableau de bord de gestion",
            url: "/salon_app/#/admin-zara",
            icons: [{ src: "favicon.ico", sizes: "192x192" }]
          }
        ],
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
