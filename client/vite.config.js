import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        port: 8080,
        strictPort: false,
        host: true,  // ← yeh add karo
        proxy: {
            "/api": {
                target: "http://127.0.0.1:5000",
                changeOrigin: true,
                secure: false,
            }
        }
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
