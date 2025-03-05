import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "My Awesome Blog",
    description: 'Welcome to my personal blog, where I share my learnings.',
    head: [
        ['link', {rel: 'icon', type: 'image/png', href:"/favicon-96x96.png", sizes:"96x96"}],
        ['link', {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'}],
        ['link', {rel: 'icon', type: 'image/png', href: '/favicon.ico'}],
        ['link', {rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png'}],
        ['link', {rel: "manifest", href:"/site.webmanifest"}],
    ],
    themeConfig: {
        search: {
            provider: 'local'
        },
        lastUpdated: {
            text: "Updated at",
            formatOptions: {
                timeZone: "Asia/Shanghai",
                hour12: true,
            }
        },
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {text: 'Home', link: '/'},
            // { text: 'Examples', link: '/markdown-examples' }
        ],

        sidebar: [
            {
                text: 'Golang',
                items: [
                    {text: 'Overview', link: '/golang'},
                    {text: 'Garbage Collection', link: '/golang/garbage-collection'},
                    {text: 'New and Make', link: '/golang/new-and-make'},
                ]
            },
            {
                text: 'Python',
                items: [
                    {text: 'Overview', link: '/python'},
                    {text: 'Garbage Collection', link: '/python/garbage-collection'},
                    {text: 'Decorator', link: '/python/decorator'},
                ],
            }
        ],

        socialLinks: [
            // { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
        ]
    }
})
