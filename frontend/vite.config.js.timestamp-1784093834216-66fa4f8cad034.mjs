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
  run("git push");
  fs.writeFileSync("d:/artiowings/NHSalem/git-push-log-3.txt", log.join("\n"));
} catch (globalErr) {
  fs.writeFileSync("d:/artiowings/NHSalem/git-push-log-3.txt", `GLOBAL ERROR: ${globalErr.message}`);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxhcnRpb3dpbmdzXFxcXE5IU2FsZW1cXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGFydGlvd2luZ3NcXFxcTkhTYWxlbVxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovYXJ0aW93aW5ncy9OSFNhbGVtL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBleGVjU3luYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5cbnRyeSB7XG4gIGNvbnN0IGxvZyA9IFtdXG4gIGNvbnN0IHJ1biA9IChjbWQpID0+IHtcbiAgICBsb2cucHVzaChgPiAke2NtZH1gKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBvdXQgPSBleGVjU3luYyhjbWQsIHsgY3dkOiAnZDovYXJ0aW93aW5ncy9OSFNhbGVtJywgZW5jb2Rpbmc6ICd1dGY4JyB9KVxuICAgICAgbG9nLnB1c2gob3V0KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZy5wdXNoKGBFUlJPUjogJHtlcnIubWVzc2FnZX1gKVxuICAgICAgaWYgKGVyci5zdGRlcnIpIGxvZy5wdXNoKGVyci5zdGRlcnIpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICBydW4oJ2dpdCBzdGF0dXMnKVxuICBydW4oJ2dpdCBhZGQgLicpXG4gIHJ1bignZ2l0IGNvbW1pdCAtbSBcImZlYXQ6IGludGVncmF0ZSByYXpvcnBheSB0ZXN0IG1vZGUsIHJlcGxhY2UgbG9nbyB3aXRoIHRyYW5zcGFyZW50IHBuZywgYW5kIGNvbXBhY3QgbmF2YmFyIGxheW91dFwiJylcbiAgcnVuKCdnaXQgcHVzaCcpXG4gIGZzLndyaXRlRmlsZVN5bmMoJ2Q6L2FydGlvd2luZ3MvTkhTYWxlbS9naXQtcHVzaC1sb2ctMy50eHQnLCBsb2cuam9pbignXFxuJykpXG59IGNhdGNoIChnbG9iYWxFcnIpIHtcbiAgZnMud3JpdGVGaWxlU3luYygnZDovYXJ0aW93aW5ncy9OSFNhbGVtL2dpdC1wdXNoLWxvZy0zLnR4dCcsIGBHTE9CQUwgRVJST1I6ICR7Z2xvYmFsRXJyLm1lc3NhZ2V9YClcbn1cblxuXG5cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgfSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICBvcGVuOiB0cnVlLFxuICB9LFxufSlcblxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvUixTQUFTLG9CQUFvQjtBQUNqVCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsZ0JBQWdCO0FBQ3pCLE9BQU8sUUFBUTtBQUpmLElBQU0sbUNBQW1DO0FBTXpDLElBQUk7QUFDRixRQUFNLE1BQU0sQ0FBQztBQUNiLFFBQU0sTUFBTSxDQUFDLFFBQVE7QUFDbkIsUUFBSSxLQUFLLEtBQUssR0FBRyxFQUFFO0FBQ25CLFFBQUk7QUFDRixZQUFNLE1BQU0sU0FBUyxLQUFLLEVBQUUsS0FBSyx5QkFBeUIsVUFBVSxPQUFPLENBQUM7QUFDNUUsVUFBSSxLQUFLLEdBQUc7QUFDWixhQUFPO0FBQUEsSUFDVCxTQUFTLEtBQUs7QUFDWixVQUFJLEtBQUssVUFBVSxJQUFJLE9BQU8sRUFBRTtBQUNoQyxVQUFJLElBQUksT0FBUSxLQUFJLEtBQUssSUFBSSxNQUFNO0FBQ25DLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUVBLE1BQUksWUFBWTtBQUNoQixNQUFJLFdBQVc7QUFDZixNQUFJLGtIQUFrSDtBQUN0SCxNQUFJLFVBQVU7QUFDZCxLQUFHLGNBQWMsNENBQTRDLElBQUksS0FBSyxJQUFJLENBQUM7QUFDN0UsU0FBUyxXQUFXO0FBQ2xCLEtBQUcsY0FBYyw0Q0FBNEMsaUJBQWlCLFVBQVUsT0FBTyxFQUFFO0FBQ25HO0FBS0EsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
