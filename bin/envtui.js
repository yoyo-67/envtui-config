#!/usr/bin/env node
import { spawn, execSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const indexPath = join(__dirname, "..", "index.tsx");

// Check if Bun is available
let hasBun = false;
try {
  execSync("bun --version", { stdio: "ignore" });
  hasBun = true;
} catch (error) {
  hasBun = false;
}

if (!hasBun) {
  console.error("\n❌ Bun runtime is required to run envtui\n");
  console.error("Install Bun:");
  console.error("  curl -fsSL https://bun.sh/install | bash\n");
  console.error("Then run:");
  console.error("  bunx @yoyo-org/envtui-config ./env-config.ts\n");
  process.exit(1);
}

// Run with Bun
const child = spawn("bun", ["run", indexPath, ...process.argv.slice(2)], {
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
