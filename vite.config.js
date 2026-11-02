import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative asset paths will also be useful when packaging a Brave extension.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
