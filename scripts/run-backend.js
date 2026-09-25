const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const net = require("net");

function findFreePort(start, end) {
  return new Promise((resolve) => {
    const ports = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const tryPort = (index) => {
      if (index >= ports.length) {
        resolve(8001);
        return;
      }

      const port = ports[index];
      const server = net.createServer();
      server.once("error", () => tryPort(index + 1));
      server.once("listening", () => {
        server.close(() => resolve(port));
      });
      server.listen(port, "0.0.0.0");
    };

    tryPort(0);
  });
}

(async () => {
  const backendDir = path.join(__dirname, "..", "backend");
  const venvPython = path.join(backendDir, ".venv", "Scripts", "python.exe");
  const fallbackPython = "python";
  const backendPort = await findFreePort(8000, 8010);
  const cmd = fs.existsSync(venvPython) ? venvPython : fallbackPython;
  const args = [
    "-m",
    "uvicorn",
    "app.main:app",
    "--host",
    "0.0.0.0",
    "--port",
    String(backendPort),
  ];

  console.log(`Starting backend on port ${backendPort}`);

  const child = spawn(cmd, args, {
    cwd: backendDir,
    stdio: "inherit",
    shell: false,
    env: { ...process.env, BACKEND_PORT: String(backendPort) },
  });

  child.on("exit", (code) => process.exit(code ?? 0));
})();
