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
  const backendPort = Number(process.env.BACKEND_PORT || 8000);
  const frontendPort = await findFreePort(
    3000,
    3010,
    Number(process.env.FRONTEND_PORT || 3004),
  );

  const child = spawn(
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

  child.on("exit", (code) => process.exit(code ?? 0));
})();
