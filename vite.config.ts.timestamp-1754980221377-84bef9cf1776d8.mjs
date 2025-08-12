// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => {
  const forceLocal = process.env.FORCE_LOCAL === "true";
  const isCodespace = !forceLocal && !!process.env.CODESPACE_NAME && !!process.env.GITHUB_CODESPACE_TOKEN;
  const codespaceHost = process.env.CODESPACE_NAME ? `${process.env.CODESPACE_NAME}-8080.app.github.dev` : void 0;
  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
      strictPort: true,
      hmr: isCodespace ? {
        protocol: "wss",
        host: codespaceHost,
        port: 443
      } : void 0
    },
    plugins: [
      react(),
      mode === "development" && componentTagger()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgLy8gUGVybWV0dGkgb3ZlcnJpZGUgbG9jYWxlOiBzZSBGT1JDRV9MT0NBTCBcdTAwRTggdHJ1ZSwgaWdub3JhIENPREVTUEFDRV9OQU1FXG4gIGNvbnN0IGZvcmNlTG9jYWwgPSBwcm9jZXNzLmVudi5GT1JDRV9MT0NBTCA9PT0gJ3RydWUnO1xuICBjb25zdCBpc0NvZGVzcGFjZSA9ICFmb3JjZUxvY2FsICYmICEhcHJvY2Vzcy5lbnYuQ09ERVNQQUNFX05BTUUgJiYgISFwcm9jZXNzLmVudi5HSVRIVUJfQ09ERVNQQUNFX1RPS0VOO1xuICBjb25zdCBjb2Rlc3BhY2VIb3N0ID0gcHJvY2Vzcy5lbnYuQ09ERVNQQUNFX05BTUUgPyBgJHtwcm9jZXNzLmVudi5DT0RFU1BBQ0VfTkFNRX0tODA4MC5hcHAuZ2l0aHViLmRldmAgOiB1bmRlZmluZWQ7XG4gIHJldHVybiB7XG4gICAgc2VydmVyOiB7XG4gICAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgICBwb3J0OiA4MDgwLFxuICAgICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICAgIGhtcjogaXNDb2Rlc3BhY2VcbiAgICAgICAgPyB7XG4gICAgICAgICAgICBwcm90b2NvbDogJ3dzcycsXG4gICAgICAgICAgICBob3N0OiBjb2Rlc3BhY2VIb3N0LFxuICAgICAgICAgICAgcG9ydDogNDQzLFxuICAgICAgICAgIH1cbiAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbXG4gICAgICByZWFjdCgpLFxuICAgICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJlxuICAgICAgY29tcG9uZW50VGFnZ2VyKCksXG4gICAgXS5maWx0ZXIoQm9vbGVhbiksXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUV4QyxRQUFNLGFBQWEsUUFBUSxJQUFJLGdCQUFnQjtBQUMvQyxRQUFNLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxRQUFRLElBQUksa0JBQWtCLENBQUMsQ0FBQyxRQUFRLElBQUk7QUFDakYsUUFBTSxnQkFBZ0IsUUFBUSxJQUFJLGlCQUFpQixHQUFHLFFBQVEsSUFBSSxjQUFjLHlCQUF5QjtBQUN6RyxTQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixLQUFLLGNBQ0Q7QUFBQSxRQUNFLFVBQVU7QUFBQSxRQUNWLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxNQUNSLElBQ0E7QUFBQSxJQUNOO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixTQUFTLGlCQUNULGdCQUFnQjtBQUFBLElBQ2xCLEVBQUUsT0FBTyxPQUFPO0FBQUEsSUFDaEIsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
