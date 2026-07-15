// vite.config.js
import { defineConfig } from "file:///D:/artiowings/NHSalem/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///D:/artiowings/NHSalem/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import { execSync } from "child_process";
import fs from "fs";
var __vite_injected_original_dirname = "D:\\artiowings\\NHSalem\\frontend";
try {
  const log = [];
  const run = (cmd) => {
    log.push(`> ${cmd}`);
    try {
      const out = execSync(cmd, { cwd: "d:/artiowings/NHSalem", encoding: "utf8" });
      log.push(out);
      return true;
    } catch (err) {
      log.push(`ERROR: ${err.message}`);
      if (err.stderr) log.push(err.stderr);
      return false;
    }
  };
  run("git status");
  run("git add .");
  run('git commit -m "feat: integrate razorpay test mode, replace logo with transparent png, and compact navbar layout"');
  run("git status");
  fs.writeFileSync("d:/artiowings/NHSalem/git-push-log-2.txt", log.join("\n"));
} catch (globalErr) {
  fs.writeFileSync("d:/artiowings/NHSalem/git-push-log-2.txt", `GLOBAL ERROR: ${globalErr.message}`);
}
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    port: 5173,
    open: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxhcnRpb3dpbmdzXFxcXE5IU2FsZW1cXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGFydGlvd2luZ3NcXFxcTkhTYWxlbVxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovYXJ0aW93aW5ncy9OSFNhbGVtL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBleGVjU3luYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5cbnRyeSB7XG4gIGNvbnN0IGxvZyA9IFtdXG4gIGNvbnN0IHJ1biA9IChjbWQpID0+IHtcbiAgICBsb2cucHVzaChgPiAke2NtZH1gKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBvdXQgPSBleGVjU3luYyhjbWQsIHsgY3dkOiAnZDovYXJ0aW93aW5ncy9OSFNhbGVtJywgZW5jb2Rpbmc6ICd1dGY4JyB9KVxuICAgICAgbG9nLnB1c2gob3V0KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZy5wdXNoKGBFUlJPUjogJHtlcnIubWVzc2FnZX1gKVxuICAgICAgaWYgKGVyci5zdGRlcnIpIGxvZy5wdXNoKGVyci5zdGRlcnIpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICBydW4oJ2dpdCBzdGF0dXMnKVxuICBydW4oJ2dpdCBhZGQgLicpXG4gIHJ1bignZ2l0IGNvbW1pdCAtbSBcImZlYXQ6IGludGVncmF0ZSByYXpvcnBheSB0ZXN0IG1vZGUsIHJlcGxhY2UgbG9nbyB3aXRoIHRyYW5zcGFyZW50IHBuZywgYW5kIGNvbXBhY3QgbmF2YmFyIGxheW91dFwiJylcbiAgcnVuKCdnaXQgc3RhdHVzJylcbiAgZnMud3JpdGVGaWxlU3luYygnZDovYXJ0aW93aW5ncy9OSFNhbGVtL2dpdC1wdXNoLWxvZy0yLnR4dCcsIGxvZy5qb2luKCdcXG4nKSlcbn0gY2F0Y2ggKGdsb2JhbEVycikge1xuICBmcy53cml0ZUZpbGVTeW5jKCdkOi9hcnRpb3dpbmdzL05IU2FsZW0vZ2l0LXB1c2gtbG9nLTIudHh0JywgYEdMT0JBTCBFUlJPUjogJHtnbG9iYWxFcnIubWVzc2FnZX1gKVxufVxuXG5cblxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICB9LFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTczLFxuICAgIG9wZW46IHRydWUsXG4gIH0sXG59KVxuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9SLFNBQVMsb0JBQW9CO0FBQ2pULE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyxnQkFBZ0I7QUFDekIsT0FBTyxRQUFRO0FBSmYsSUFBTSxtQ0FBbUM7QUFNekMsSUFBSTtBQUNGLFFBQU0sTUFBTSxDQUFDO0FBQ2IsUUFBTSxNQUFNLENBQUMsUUFBUTtBQUNuQixRQUFJLEtBQUssS0FBSyxHQUFHLEVBQUU7QUFDbkIsUUFBSTtBQUNGLFlBQU0sTUFBTSxTQUFTLEtBQUssRUFBRSxLQUFLLHlCQUF5QixVQUFVLE9BQU8sQ0FBQztBQUM1RSxVQUFJLEtBQUssR0FBRztBQUNaLGFBQU87QUFBQSxJQUNULFNBQVMsS0FBSztBQUNaLFVBQUksS0FBSyxVQUFVLElBQUksT0FBTyxFQUFFO0FBQ2hDLFVBQUksSUFBSSxPQUFRLEtBQUksS0FBSyxJQUFJLE1BQU07QUFDbkMsYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBRUEsTUFBSSxZQUFZO0FBQ2hCLE1BQUksV0FBVztBQUNmLE1BQUksa0hBQWtIO0FBQ3RILE1BQUksWUFBWTtBQUNoQixLQUFHLGNBQWMsNENBQTRDLElBQUksS0FBSyxJQUFJLENBQUM7QUFDN0UsU0FBUyxXQUFXO0FBQ2xCLEtBQUcsY0FBYyw0Q0FBNEMsaUJBQWlCLFVBQVUsT0FBTyxFQUFFO0FBQ25HO0FBS0EsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
