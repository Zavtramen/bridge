import i18nOptions from "./modules/i18n";

export default {
    // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
    ssr: false,

    // Target: https://go.nuxtjs.dev/config-target
    target: 'static',

    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        title: 'TON Bridge',
        htmlAttrs: {
            lang: 'en',
            translate: 'no'
        },
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: ' width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, minimal-ui, viewport-fit=cover' },
            { hid: 'description', name: 'description', content: 'TON Bridge' },
            { hid: 'google', name: 'google', content: 'notranslate' },
            { name: 'format-detection', content: 'telephone=no' }
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
        ]
    },

    loading: false,

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: [
        '@/assets/styles/reboot.css'
    ],

    // Global LESS variables
    styleResources: {
        less: ['@/assets/styles/variables.less']
    },

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [
        { src: '@/plugins/global.helpers.js'},
    ],

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: false,

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
        // https://go.nuxtjs.dev/typescript
        '@nuxt/typescript-build',
        'nuxt-compress',
        // Doc: https://github.com/nuxt-community/style-resources-module
        ['@nuxtjs/style-resources']
    ],

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [
        // https://go.nuxtjs.dev/axios
        '@nuxtjs/axios',
        ['nuxt-i18n', i18nOptions]
    ],

    // Axios module configuration: https://go.nuxtjs.dev/config-axios
    axios: {},

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
        // extend (config, { isDev, isClient }) {
        //     if (!isDev) {
        //         // relative links, please.
        //         config.output.publicPath = './_nuxt/'
        //     }
        //     return config;
        // }
    },
    router: {
        base: '/bridge/'
    }
}
