import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "My Awesome Project",
    description: "A VitePress Site",
    themeConfig: {
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
                    // {text: 'Base', link: '/golang'},
                    {text: 'Garbage Collection', link: '/golang/garbage-collection'},
                ]
            },
            {
                text: 'Python',
                items: [
                    // {text: 'Base', link: '/python'},
                    {text: 'Garbage Collection', link: '/python/garbage-collection'},
                ],
            }
        ],

        socialLinks: [
            // { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
        ]
    }
})
