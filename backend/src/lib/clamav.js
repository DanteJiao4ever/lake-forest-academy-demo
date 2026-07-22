import net from "node:net";
import { ApiError } from "./errors.js";

function sizePrefix(size) {
  const prefix = Buffer.allocUnsafe(4);
  prefix.writeUInt32BE(size, 0);
  return prefix;
}

export class ClamAvScanner {
  constructor({ host, port, required = true, timeoutMs = 15_000 }) {
    this.host = host;
    this.port = port;
    this.required = required;
    this.timeoutMs = timeoutMs;
  }

  async ready() {
    try {
      const response = await new Promise((resolve, reject) => {
        const socket = net.createConnection({ host: this.host, port: this.port });
        const chunks = [];
        let settled = false;

        function finish(error, value) {
          if (settled) return;
          settled = true;
          socket.destroy();
          if (error) reject(error);
          else resolve(value);
        }

        socket.setTimeout(this.timeoutMs);
        socket.on("connect", () => socket.write("zPING\0"));
        socket.on("data", (chunk) => {
          chunks.push(chunk);
          const reply = Buffer.concat(chunks).toString("utf8");
          if (reply.includes("\0") || reply.includes("\n")) finish(null, reply);
        });
        socket.on("end", () => finish(null, Buffer.concat(chunks).toString("utf8")));
        socket.on("timeout", () => finish(new Error("ClamAV timeout")));
        socket.on("error", (error) => finish(error));
      });
      if (response.replaceAll("\0", "").trim() !== "PONG") {
        throw new Error("Unexpected ClamAV PING response");
      }
      return true;
    } catch {
      throw new ApiError(
        503,
        "MALWARE_SCANNER_UNAVAILABLE",
        "File scanning is temporarily unavailable.",
      );
    }
  }

  async scan(buffer) {
    try {
      const response = await new Promise((resolve, reject) => {
        const socket = net.createConnection({ host: this.host, port: this.port });
        const chunks = [];
        socket.setTimeout(this.timeoutMs);
        socket.on("connect", () => {
          socket.write("zINSTREAM\0");
          for (let offset = 0; offset < buffer.length; offset += 64 * 1024) {
            const chunk = buffer.subarray(offset, offset + 64 * 1024);
            socket.write(sizePrefix(chunk.length));
            socket.write(chunk);
          }
          socket.end(sizePrefix(0));
        });
        socket.on("data", (chunk) => chunks.push(chunk));
        socket.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        socket.on("timeout", () => socket.destroy(new Error("ClamAV timeout")));
        socket.on("error", reject);
      });
      if (/\bFOUND\b/.test(response)) {
        throw new ApiError(422, "MALWARE_DETECTED", "The uploaded file did not pass the security scan.");
      }
      if (!/\bOK\b/.test(response)) throw new Error("Unexpected ClamAV response");
      return { clean: true };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (this.required) {
        throw new ApiError(503, "MALWARE_SCANNER_UNAVAILABLE", "File scanning is temporarily unavailable.");
      }
      return { clean: true, skipped: true };
    }
  }
}
