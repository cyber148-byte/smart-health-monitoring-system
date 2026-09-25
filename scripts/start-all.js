const { spawn } = require("child_process");
const net = require("net");

function findFreePort(start, end, preferred) {
  return new Promise((resolve) => {
    const ports =
      preferred && preferred >= start && preferred <= end
        ? [
            preferred,
            ...Array.from(
              { length: end - start + 1 },
              (_, i) => start + i,
            ).filter((p) => p !== preferred),
          ]
        : Array.from({ length: end - start + 1 }, (_, i) => start + i);

    const tryPort = (index) => {
      if (index >= ports.length) {
        resolve(preferred || start);
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
  const backendPort = await findFreePort(8000, 8010, 8000);
  const frontendPort = await findFreePort(3000, 3010, 3004);

  const frontend = spawn(
    "npx",
    ["vite", "--host", "0.0.0.0", "--port", String(frontendPort)],
    {
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        FRONTEND_PORT: String(frontendPort),
        VITE_API_TARGET: `http://localhost:${backendPort}`,
      },
    },
  );

  const backend = spawn(
    "cmd",
    [
      "/c",
      `cd backend && .\\.venv\\Scripts\\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port ${backendPort}`,
    ],
    {
      stdio: "inherit",
      shell: false,
      env: {
        ...process.env,
        BACKEND_PORT: String(backendPort),
      },
    },
  );

  frontend.on("exit", (code) => {
    if (code !== 0) process.exit(code ?? 1);
  });

  backend.on("exit", (code) => {
    if (code !== 0) process.exit(code ?? 1);
  });
})();
