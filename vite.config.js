import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'app-html-spa-rewrite',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const url = (req.url ?? '').split('?')[0]

          // Match Vercel rewrites for SPA routes so local dev behaves the same.
          const shouldRewriteToApp =
            url === '/character' ||
            url.startsWith('/character/') ||
            url.startsWith('/share/') ||
            url === '/settings' ||
            url.startsWith('/settings/') ||
            url === '/test' ||
            url.startsWith('/test/') ||
            url === '/auth' ||
            url.startsWith('/auth/')

          if (shouldRewriteToApp) {
            req.url = '/app.html'
          }

          // Serve index.html for baza-wiedzy directory paths (trailing slash or bare path)
          if (!shouldRewriteToApp && url.startsWith('/baza-wiedzy') && !url.includes('.')) {
            req.url = url.replace(/\/?$/, '/index.html')
          }

          next()
        })
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        app: './app.html'
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    port: 5173,
    open: true,
    middlewareMode: false,
  },
  preview: {
    port: 5173,
  }
})
