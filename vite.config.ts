import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Permetti override locale: se FORCE_LOCAL è true, ignora CODESPACE_NAME
  const forceLocal = process.env.FORCE_LOCAL === 'true';
  const isCodespace = !forceLocal && !!process.env.CODESPACE_NAME && !!process.env.GITHUB_CODESPACE_TOKEN;
  const codespaceHost = process.env.CODESPACE_NAME ? `${process.env.CODESPACE_NAME}-8080.app.github.dev` : undefined;
  return {
    server: {
      host: '0.0.0.0',
      port: 8080,
      strictPort: true,
      hmr: isCodespace
        ? {
            protocol: 'wss',
            host: codespaceHost,
            port: 443,
          }
        : undefined,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
