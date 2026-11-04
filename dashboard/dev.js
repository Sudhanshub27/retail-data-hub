const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const venvPosix = path.join(projectRoot, ".venv", "bin", "python3");
const venvWin = path.join(projectRoot, ".venv", "Scripts", "python.exe");

let pythonBin = "python3";
if (fs.existsSync(venvPosix)) {
  pythonBin = venvPosix;
} else if (fs.existsSync(venvWin)) {
  pythonBin = venvWin;
}

function checkBackend() {
  return new Promise((resolve) => {
    const req = http.get("http://localhost:8000/api/health", (res) => {
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("\x1b[36m%s\x1b[0m", "[Retail Data Hub] Checking FastAPI backend status...");
  const isAlreadyRunning = await checkBackend();
  let backendProcess = null;

  if (isAlreadyRunning) {
    console.log("\x1b[32m%s\x1b[0m", "[Retail Data Hub] FastAPI backend is already running on http://localhost:8000");
  } else {
    console.log("\x1b[33m%s\x1b[0m", `[Retail Data Hub] Starting FastAPI backend with ${pythonBin}...`);
    backendProcess = spawn(pythonBin, ["src/api/api.py"], {
      cwd: projectRoot,
      stdio: "inherit",
    });

    backendProcess.on("error", (err) => {
      console.error("\x1b[31m%s\x1b[0m", `[Retail Data Hub] Failed to spawn backend: ${err.message}`);
    });

    // Wait until backend answers /api/health (up to 10 seconds)
    let ready = false;
    for (let i = 0; i < 20; i++) {
      await wait(500);
      ready = await checkBackend();
      if (ready) break;
    }

    if (ready) {
      console.log("\x1b[32m%s\x1b[0m", "[Retail Data Hub] FastAPI backend is ready on http://localhost:8000");
    } else {
      console.warn("\x1b[33m%s\x1b[0m", "[Retail Data Hub] Backend launch is in progress. Starting frontend...");
    }
  }

  console.log("\x1b[36m%s\x1b[0m", "[Retail Data Hub] Launching Next.js frontend...");

  const nextBin = path.join(
    __dirname,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "next.cmd" : "next"
  );
  const frontendCmd = fs.existsSync(nextBin) ? nextBin : "next";

  const frontendProcess = spawn(frontendCmd, ["dev"], {
    cwd: __dirname,
    stdio: "inherit",
  });

  const cleanup = () => {
    if (backendProcess) {
      console.log("\x1b[33m%s\x1b[0m", "\n[Retail Data Hub] Shutting down backend process...");
      try {
        backendProcess.kill("SIGTERM");
      } catch (e) {
        // process already terminated
      }
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  frontendProcess.on("exit", (code) => {
    if (backendProcess) {
      try {
        backendProcess.kill("SIGTERM");
      } catch (e) {}
    }
    process.exit(code || 0);
  });
}

main().catch((err) => {
  console.error("Fatal launcher error:", err);
  process.exit(1);
});

