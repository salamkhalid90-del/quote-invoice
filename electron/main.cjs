const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");

const rootDir = path.join(__dirname, "..");
const port = 3000;
let serverProcess;

function waitForServer(url, timeoutMs = 45000) {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    function attempt() {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });

      request.on("error", retry);
      request.setTimeout(2500, () => {
        request.destroy();
        retry();
      });
    }

    function retry() {
      if (Date.now() - started > timeoutMs) {
        reject(new Error("لم يتم تشغيل الخادم المحلي خلال الوقت المحدد."));
        return;
      }
      setTimeout(attempt, 700);
    }

    attempt();
  });
}

function isServerRunning(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(Boolean(response.statusCode && response.statusCode < 500));
    });

    request.on("error", () => resolve(false));
    request.setTimeout(1200, () => {
      request.destroy();
      resolve(false);
    });
  });
}

function startNextServer() {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  serverProcess = spawn(npmCommand, ["run", "start", "--", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: rootDir,
    env: { ...process.env, BROWSER: "none" },
    stdio: "ignore",
    windowsHide: true
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1100,
    minHeight: 720,
    title: "Smart Quote & Invoice Manager",
    backgroundColor: "#f6f8fb",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  window.loadURL(`http://127.0.0.1:${port}`);
}

app.whenReady().then(async () => {
  const url = `http://127.0.0.1:${port}`;
  const alreadyRunning = await isServerRunning(url);
  if (!alreadyRunning) {
    startNextServer();
  }
  try {
    await waitForServer(url);
    createWindow();
  } catch (error) {
    dialog.showErrorBox("Smart Quote", error.message);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
});
