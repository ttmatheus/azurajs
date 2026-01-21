import net from "node:net";

export function getOpenPort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();

    server.on("error", () => {
      resolve(getOpenPort(startPort + 1));
    });
    server.listen(startPort, () => {
      server.close(() => resolve(startPort));
    });
  });
}
