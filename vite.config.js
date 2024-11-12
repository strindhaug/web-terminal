import { resolve } from "node:path"
import { defineConfig } from "vite"

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                textos: resolve(__dirname, "index.html"),
            },
        },
    },
})
