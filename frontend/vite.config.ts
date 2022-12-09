import solid from "solid-start/vite"
import { defineConfig } from "vite"

export default defineConfig({
    plugins: [solid({
        ssr: true,
        hot: true,
        dev: true,
        solid: {
            hydratable: true
        },
    })],
})
