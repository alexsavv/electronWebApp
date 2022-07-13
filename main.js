// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 850,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  mainWindow.on('close', function (evt) {
    evt.preventDefault();
    mainWindow.hide();
  });

  mainWindow.maximize();

  // Create the mapWindow.
  const mapWindow = new BrowserWindow({
    show: false,
    width: 1000,
    height: 850,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  //load map html page to mapWindow
  mapWindow.loadFile('./pages/map.html');
  mapWindow.on('close', function (evt) {
    evt.preventDefault();
    mapWindow.hide();
  });

  // Create the sqlWindow.
  const sqlWindow = new BrowserWindow({
    show: false,
    width: 1000,
    height: 850,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  //load map html page to mapWindow
  sqlWindow.loadFile('./pages/sql.html');
  sqlWindow.on('close', function (evt) {
    evt.preventDefault();
    sqlWindow.hide();
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  ipcMain.on('changeWindow', function (event, arg) {
    switch (arg) {
      case 'map':
        mapWindow.show();
        mapWindow.maximize();
        mainWindow.close();
        break;
      case 'sql':
        sqlWindow.show();
        sqlWindow.maximize();
        mainWindow.close();
        break;
      case 'sqlTomain':
        mainWindow.show();
        mainWindow.maximize();
        sqlWindow.close();
        break;
      case 'sqlTomap':
        mapWindow.show();
        mapWindow.maximize();
        sqlWindow.close();
        break;
      case 'sqlTosql':
        sqlWindow.show();
        sqlWindow.maximize();
        sqlWindow.close();
        break;
      case 'main':
        mainWindow.show();
        mainWindow.maximize();
        mapWindow.close();
        break;
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
