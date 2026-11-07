import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const hostIndex = args.indexOf("--host");
const command = args.includes("--production")
  ? ["start"]
  : ["dev", "--webpack"];
const child = spawn(
  process.execPath,
  [
    fileURLToPath(import.meta.resolve("next/dist/bin/next")),
    ...command,
    "--hostname",
    hostIndex >= 0 ? args[hostIndex + 1] : "0.0.0.0",
    "--port",
    portIndex >= 0 ? args[portIndex + 1] : "3000",
  ],
  { stdio: "inherit", env: process.env },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 0));
