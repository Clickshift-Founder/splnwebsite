// Starts the local PGlite server, waits for it, then runs `next dev`. Ctrl+C stops both.
import { spawn } from "node:child_process";
import net from "node:net";

const PORT = Number(process.env.PGLITE_PORT ?? 54329);
const isUp = () =>
  new Promise((resolve) => {
    const s = net.connect(PORT, "127.0.0.1", () => (s.end(), resolve(true)));
    s.on("error", () => resolve(false));
  });

const children = [];
if (!(await isUp())) {
  children.push(spawn(process.execPath, ["scripts/dev-db.mjs"], { stdio: "inherit" }));
  for (let i = 0; i < 60 && !(await isUp()); i++) await new Promise((r) => setTimeout(r, 250));
}
const nextBin = new URL("../node_modules/next/dist/bin/next", import.meta.url);
children.push(spawn(process.execPath, [nextBin.pathname.replace(/^\/([A-Z]:)/, "$1"), "dev", ...process.argv.slice(2)], { stdio: "inherit" }));

const stop = () => children.forEach((c) => c.kill("SIGINT"));
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
children.at(-1).on("exit", (code) => (stop(), process.exit(code ?? 0)));
