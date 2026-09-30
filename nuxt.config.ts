// https://nuxt.com/docs/api/configuration/nuxt-config
const SITE = {
  url: 'https://parley.emircan-erdemci.workers.dev',
  title: 'Parley · AI chat with live tool cards',
  // Under ~125 characters so link previews don't truncate it on mobile.
  description: 'Streaming AI chat with live tool cards for weather, maths and time. Free to try, built with Nuxt UI on Cloudflare.',
  imageAlt: 'Parley: AI chat that talks it through'
}

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@comark/nuxt'],

  // Chats live in the browser (localStorage), so the app is a SPA and the Worker only serves the API.
  ssr: false,

  devtools: { enabled: true },

  app: {
    // Everything here is in the first HTML response, so crawlers and link previews see it without running JS.
    head: {
      title: SITE.title,
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: SITE.description },
        { name: 'author', content: 'Emircan Erdemci' },
        { name: 'theme-color', content: '#000000' },
        { name: 'color-scheme', content: 'dark light' },

        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Parley' },
        { property: 'og:title', content: SITE.title },
        { property: 'og:description', content: SITE.description },
        { property: 'og:url', content: SITE.url },
        { property: 'og:image', content: `${SITE.url}/og.png` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: SITE.imageAlt },
        { property: 'og:locale', content: 'en_US' },

        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: SITE.title },
        { name: 'twitter:description', content: SITE.description },
        { name: 'twitter:image', content: `${SITE.url}/og.png` },
        { name: 'twitter:image:alt', content: SITE.imageAlt }
      ],
      link: [
        { rel: 'canonical', href: SITE.url },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ],
      script: [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          'name': 'Parley',
          'url': SITE.url,
          'description': SITE.description,
          'applicationCategory': 'ChatApplication',
          'operatingSystem': 'Any',
          'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
          'author': { '@type': 'Person', 'name': 'Emircan Erdemci', 'url': 'https://emircyn.com' },
          'codeRepository': 'https://github.com/Emircyn/parley'
        })
      }]
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
      { name: 'Geist', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Geist Mono', provider: 'google', weights: [400, 500] },
      { name: 'Doto', provider: 'google', weights: [800, 900] }
    ]
  },

  icon: {
    // Bundle every icon the app uses; never fetch icons from the Iconify API at runtime (CSP + privacy).
    // Scan .ts too: weather icons are picked at runtime in shared/utils/weather.ts.
    clientBundle: { scan: { globInclude: ['app/**/*.{vue,ts}', 'shared/**/*.ts'] } },
    fallbackToApi: false
  }
})
