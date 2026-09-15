import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    // Garantit que Vercel trouve toujours un dossier `dist/` valide avec index.html.
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    // En local, `vercel dev` sert /api/ai. Ce proxy permet aussi de tester la clé
    // locale via la variable d'environnement VITE_GROQ_API_KEY (facultatif).
    proxy: {
      "/api/ai": {
        target: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
