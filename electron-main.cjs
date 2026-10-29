const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function checkServerReady(callback, retries = 30) {
  const req = http.get('http://localhost:3000/api/health', (res) => {
    if (res.statusCode === 200) {
      callback();
    } else if (retries > 0) {
      setTimeout(() => checkServerReady(callback, retries - 1), 300);
    } else {
      callback();
    }
  });

  req.on('error', () => {
    if (retries > 0) {
      setTimeout(() => checkServerReady(callback, retries - 1), 300);
    } else {
      callback();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    autoHideMenuBar: true,
    title: "Robotics & Mechatronics Project Workbench",
    backgroundColor: '#0F172A',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  // 启动本地后端服务
  serverProcess = spawn('node', [path.join(__dirname, 'dist/server.cjs')], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start backend server:', err);
  });
  
  // 轮询等待后端健康就绪后开启窗口
  checkServerReady(createWindow);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  if (serverProcess) {
    try {
      serverProcess.kill('SIGTERM');
    } catch {
      // ignore
    }
  }
});

