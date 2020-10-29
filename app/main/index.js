import path from 'path';
import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron';

const isDevelopment = process.env.NODE_ENV === 'development';
const icon = nativeImage.createFromPath(path.join(__dirname, '../renderer/assets/icon.png'));

let mainWindow = null;
let forceQuit = false;

const createTray = () => {
  const appIcon = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir',
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: 'Sair',
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  appIcon.on('double-click', function (event) {
    mainWindow.show();
  });

  appIcon.setToolTip('Infinity Softphone');
  appIcon.setContextMenu(contextMenu);

  return appIcon;
};

app.disableHardwareAcceleration();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  mainWindow = new BrowserWindow({
    width: isDevelopment ? 640 : 250,
    height: 490,
    show: false,
    frame: false,
    resizable: isDevelopment ? true : false,
    icon,
    // alwaysOnTop: true,
    webPreferences: {
      devTools: isDevelopment ? true : false,
      nodeIntegration: true,
      enableRemoteModule: true,
      // preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.resolve(path.join(__dirname, '../renderer/index.html')));

  let tray = null;
  mainWindow.on('minimize', event => {
    event.preventDefault();
    mainWindow.setSkipTaskbar(true);
    tray = createTray();
  });

  mainWindow.on('restore', event => {
    mainWindow.show();
    mainWindow.setSkipTaskbar(false);
    tray.destroy();
  });

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    if (process.platform === 'darwin') {
      mainWindow.on('close', function (e) {
        if (!forceQuit) {
          e.preventDefault();
          mainWindow.hide();
        }
      });

      app.on('activate', () => {
        mainWindow.show();
      });

      app.on('before-quit', () => {
        forceQuit = true;
      });
    } else {
      mainWindow.on('closed', () => {
        mainWindow = null;
      });
    }
  });

  mainWindow.setMenuBarVisibility(false);

  if (isDevelopment) {
    mainWindow.webContents.openDevTools({ mode: 'right' });

    mainWindow.webContents.on('context-menu', (e, props) => {
      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click() {
            mainWindow.inspectElement(props.x, props.y);
          },
        },
      ]).popup(mainWindow);
    });
  }
});

app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
app.commandLine.appendSwitch('allow-insecure-localhost', 'true');
