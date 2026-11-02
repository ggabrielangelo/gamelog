// vite.config.ts
import { defineConfig } from "file:///C:/TCC_GABRIEL%20GAMELOG/node_modules/vite/dist/node/index.js";
import react from "file:///C:/TCC_GABRIEL%20GAMELOG/node_modules/@vitejs/plugin-react/dist/index.js";
import istanbul from "file:///C:/TCC_GABRIEL%20GAMELOG/node_modules/vite-plugin-istanbul/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    istanbul({
      include: "src/**/*",
      exclude: ["node_modules", "cypress/**"],
      extension: [".ts", ".tsx"],
      cypress: true,
      requireEnv: false
    })
  ],
  server: {
    port: 5173,
    strictPort: true
  },
  preview: {
    port: 5173
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxUQ0NfR0FCUklFTCBHQU1FTE9HXFxcXGFwcHNcXFxcd2ViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxUQ0NfR0FCUklFTCBHQU1FTE9HXFxcXGFwcHNcXFxcd2ViXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9UQ0NfR0FCUklFTCUyMEdBTUVMT0cvYXBwcy93ZWIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgaXN0YW5idWwgZnJvbSAndml0ZS1wbHVnaW4taXN0YW5idWwnO1xuXG4vLyBJbnN0cnVtZW50YVx1MDBFN1x1MDBFM28gZGUgY29iZXJ0dXJhIGV4aWdpZGEgcGVsb3MgMyBjZW5cdTAwRTFyaW9zIGRvIGV4cGVyaW1lbnRvIChUQ0MpLlxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgaXN0YW5idWwoe1xuICAgICAgaW5jbHVkZTogJ3NyYy8qKi8qJywgICAgICAgICAgIFxuICAgICAgZXhjbHVkZTogWydub2RlX21vZHVsZXMnLCAnY3lwcmVzcy8qKiddLFxuICAgICAgZXh0ZW5zaW9uOiBbJy50cycsICcudHN4J10sXG4gICAgICBjeXByZXNzOiB0cnVlLCAgICAgICAgICAgICAgICAgXG4gICAgICByZXF1aXJlRW52OiBmYWxzZSxcbiAgICB9KSxcbiAgXSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICB9LFxuICBwcmV2aWV3OiB7XG4gICAgcG9ydDogNTE3MyxcbiAgfSxcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBeVIsU0FBUyxvQkFBb0I7QUFDdFQsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sY0FBYztBQUdyQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsTUFDUCxTQUFTO0FBQUEsTUFDVCxTQUFTLENBQUMsZ0JBQWdCLFlBQVk7QUFBQSxNQUN0QyxXQUFXLENBQUMsT0FBTyxNQUFNO0FBQUEsTUFDekIsU0FBUztBQUFBLE1BQ1QsWUFBWTtBQUFBLElBQ2QsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxFQUNkO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
