// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@comark/nuxt'],

  // Chats live in the browser (localStorage), so the app is a SPA and the Worker only serves the API.
  ssr: false,

  devtools: { enabled: true },

  app: {
    head: {
      title: 'Parley',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Parley is an AI chat with streaming replies and live tool cards, running on Cloudflare Workers AI.' },
        { name: 'theme-color', content: '#1c1917' }
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
    }
  },

  css: ['~/assets/css/main.css'],
  spaLoadingTemplate: 'app/spa-loading-template.html',

  runtimeConfig: {
    public: {
      // Workers AI model id, the single setting that picks the model (NUXT_PUBLIC_AI_MODEL at build time).
      aiModel: '@cf/zai-org/glm-4.7-flash'
    }
  },

  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Cross-Origin-Opener-Policy': 'same-origin'
      }
    }
  },

  compatibilityDate: '2026-09-29',

  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    },
    typescript: {
      tsConfig: {
        compilerOptions: { types: ['@cloudflare/workers-types'] }
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  fonts: {
    families: [
      { name: 'Instrument Sans', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Instrument Serif', provider: 'google', weights: [400], styles: ['normal', 'italic'] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500] }
    ]
  },

  icon: {
    // Bundle every icon the app uses; never fetch icons from the Iconify API at runtime (CSP + privacy).
    // Scan .ts too: weather icons are picked at runtime in app/utils/weather.ts.
    clientBundle: { scan: { globInclude: ['app/**/*.{vue,ts}'] } },
    fallbackToApi: false
  }
})
