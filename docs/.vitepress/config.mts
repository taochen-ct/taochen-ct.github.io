import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "A HA !!!",
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
                    {text: 'Goroutine & Concurrency', link: '/golang/goroutine'},
                    {text: 'Interface', link: '/golang/interface'},
                    {text: 'Error Handling', link: '/golang/error'},
                    {text: 'Database', link: '/golang/database'},
                    {text: 'HTTP Client', link: '/golang/http-client'},
                    {text: 'Generics', link: '/golang/generics'},
                    {text: 'Context Package', link: '/golang/context'},
                    {text: 'Testing', link: '/golang/testing'},
                    {text: 'gRPC', link: '/golang/grpc'},
                    {text: 'Gin Framework', link: '/golang/gin'},
                ]
            },
            {
                text: 'Python',
                items: [
                    {text: 'Overview', link: '/python'},
                    {text: 'Garbage Collection', link: '/python/garbage-collection'},
                    {text: 'Decorator', link: '/python/decorator'},
                    {text: 'Event Loop', link: '/python/eventloop'},
                    {text: 'Asyncio', link: '/python/asyncio'},
                    {text: 'Context Managers & Generators', link: '/python/context-gen'},
                    {text: 'Advanced Asyncio', link: '/python/advanced-asyncio'},
                    {text: 'Type Hints & Pydantic', link: '/python/typing'},
                    {text: 'Async HTTP (httpx)', link: '/python/httpx'},
                    {text: 'Package Management (Poetry)', link: '/python/poetry'},
                    {text: 'Testing (pytest)', link: '/python/pytest'},
                    {text: 'Logging', link: '/python/logging'},
                    {text: 'Database (SQLAlchemy)', link: '/python/sqlalchemy'},
                    {text: 'FastAPI', link: '/python/fastapi'},
                ],
            },
            {
                text: 'Docker',
                items: [
                    {text: 'Overview', link: '/docker'},
                    {text: 'Container Commands', link: '/docker/container'},
                    {text: 'Error Solutions', link: '/docker/error'},
                    {text: 'Dockerfile', link: '/docker/dockerfile'},
                    {text: 'Docker Compose', link: '/docker/compose'},
                ]
            },
            {
                text: 'Linux',
                items: [
                    {text: 'Overview', link: '/linux'},
                    {text: 'Basic Commands', link: '/linux/commands'},
                    {text: 'Network', link: '/linux/network'},
                    {text: 'Systemd', link: '/linux/systemd'},
                ]
            },
            {
                text: 'AI',
                items: [
                    {text: 'Overview', link: '/ai'},
                    {text: 'Transformers', link: '/ai/transformers'},
                    {text: 'A2A Protocol', link: '/ai/a2a'},
                    {text: 'Skill', link: '/ai/skill'},
                    {text: 'MCP', link: '/ai/mcp'},
                    {text: 'Harness Engineering', link: '/ai/harness'},
                    {text: 'Context Engineering', link: '/ai/context'},
                    {text: 'Agent Loop', link: '/ai/agent-loop'},
                    {text: 'LangChain', link: '/ai/langchain'},
                    {text: 'LangChain Agent', link: '/ai/langchain-agent'},
                    {text: 'RAG & Embeddings', link: '/ai/rag'},
                    {text: 'Prompt Engineering', link: '/ai/prompt'},
                    {text: 'Function Calling', link: '/ai/function'},
                    {text: 'LLM Deployment', link: '/ai/deployment'},
                    {text: 'Ollama', link: '/ai/ollama'},
                    {text: 'vLLM', link: '/ai/vllm'},
                ]
            },
            {
                text: 'Review',
                items: [
                    {text: 'Overview', link: '/review'},
                    {text: '3.26', link: '/review/3-26'},
                    {text: '3.27', link: '/review/3-27'},
                    {text: '4.2', link: '/review/4-2'},
                    {text: '4.3', link: '/review/4-3'},
                ],
            },
        ],

        socialLinks: [
            // { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
        ]
    }
})
