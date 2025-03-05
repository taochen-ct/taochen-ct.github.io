import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "My Awesome Blog",
    description: 'Welcome to my personal blog, where I share my learnings.',
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
