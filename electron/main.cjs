const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("node:child_process");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.join(__dirname, "..");
const port = 3000;
let serverProcess;
let mainWindow;
const logFile = path.join(rootDir, "electron-runtime.log");

function log(message) {
  fs.appendFileSync(logFile, `${new Date().toISOString()} ${message}\n`);
}

app.setPath("userData", path.join(rootDir, ".electron-data"));
app.disableHardwareAcceleration();
app.commandLine.appendSwitch("no-sandbox");
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-gpu-sandbox");
app.commandLine.appendSwitch("disable-gpu-compositing");

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
  if (process.platform === "win32") {
    serverProcess = spawn(
      "cmd.exe",
      ["/c", "start", '""', "/min", "npm.cmd", "run", "start", "--", "-H", "127.0.0.1", "-p", String(port)],
      {
        cwd: rootDir,
        env: { ...process.env, BROWSER: "none" },
        stdio: "ignore",
        windowsHide: true
      }
    );
    return;
  }

  serverProcess = spawn("npm", ["run", "start", "--", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: rootDir,
    env: { ...process.env, BROWSER: "none" },
    stdio: "ignore"
  });
}

function createWindow() {
  log("creating window");
  mainWindow = new BrowserWindow({
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

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.loadURL(`http://127.0.0.1:${port}`);
}

app.whenReady().then(async () => {
  log("app ready");
  const url = `http://127.0.0.1:${port}`;
  const alreadyRunning = await isServerRunning(url);
  log(`server running: ${alreadyRunning}`);
  if (!alreadyRunning) {
    startNextServer();
  }
  try {
    await waitForServer(url);
    log("server ready, opening window");
    createWindow();
  } catch (error) {
    log(`startup error: ${error.message}`);
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
