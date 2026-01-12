import os from "node:os";
import cluster from "node:cluster";
import { logger } from "../../utils/Logger";

export function getIP(port: number) {
  try {
    const networkInterfaces = os.networkInterfaces();

    if (!networkInterfaces || Object.keys(networkInterfaces).length === 0) {
      logger("info", `Server running on http://localhost:${port}`);
      return;
    }

    let foundIP = false;
    Object.values(networkInterfaces).forEach((ifaceList) => {
      if (!ifaceList) return;

      ifaceList.forEach((iface) => {
        const isIPv4 =
          (iface.family as string | number) === "IPv4" || (iface.family as string | number) === 4;
        if (isIPv4 && !iface.internal && iface.address) {
          foundIP = true;
          const who = cluster.isPrimary ? "master" : "worker";
          logger("info", `[${who}] accessible at http://${iface.address}:${port}`);
        }
      });
    });

    if (!foundIP) {
      logger("info", `Server running on http://localhost:${port}`);
    }
  } catch (error) {
    logger("info", `Server running on http://localhost:${port}`);
  }
}
