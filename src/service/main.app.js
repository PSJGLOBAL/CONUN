const electron = require('electron');
const {app, BrowserWindow, Menu} = electron;
const ipcMain = electron.ipcMain;
const { ipcDispatcher, subscriber } = require('conun-ipc/middleware/ipcMain.poster');


const Store = require('electron-store');
const mainStore = new Store();

// const {initAutoUpdate} = require('../js/utils/updater');
const makeDir = require('make-dir');

let mainMenu = Menu.buildFromTemplate(require('../js/controller/ui/menu/mainMenu'));
let contextMenu = Menu.buildFromTemplate(require('../js/controller/ui/menu/contextMenu'));
let trayMenu = Menu.buildFromTemplate(require('../js/controller/ui/menu/trayMenu'));
Menu.setApplicationMenu(false);
const path = require('path');
const url = require('url');

let mainWindow, mobileWindow,
    qrCodeChildWindow, addProjectWindow, tray, popUpChildWindow;

function PopUpChildWindow(object) {
    let width = object.width,
        height = object.height,
        viewBox = object.viewBox,
        frame = object.frame;
    console.log('popUpChildWindow Frame Started');
    popUpChildWindow = new BrowserWindow({
        width: width, height: height,
        maxWidth: width, maxHeight: height,
        minWidth: width, minHeight:height,
        frame: frame,
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: true
        }
    });
    popUpChildWindow.loadFile('src/view/page/popup/'+viewBox);

    popUpChildWindow.once('ready-to-show', () => {
        popUpChildWindow.show()
    });

    popUpChildWindow.webContents.openDevTools();
    popUpChildWindow.on('closed',  () => {
        popUpChildWindow = null
    })
}

function QrCodeChildWindow() {
    console.log('qrCodeChildWindow Frame Started');
    qrCodeChildWindow = new BrowserWindow({
        width: 400, height: 650,
        maxWidth: 400, maxHeight: 650,
        minWidth: 400, minHeight:650,
        parent: mainWindow,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    qrCodeChildWindow.loadFile('src/view/page/popup/export_qr.html');

    qrCodeChildWindow.once('ready-to-show', () => {
        qrCodeChildWindow.show()
    });

    qrCodeChildWindow.webContents.openDevTools();
    qrCodeChildWindow.on('closed',  () => {
        qrCodeChildWindow = null
    })
}

function AddProjectWindow() {
    console.log('addProjectWindow Frame Started');
    addProjectWindow = new BrowserWindow({
        width: 800, height: 760,
        maxWidth: 800, maxHeight: 760,
        minWidth: 800, minHeight:760,
        backgroundColor: '#2e2c29',
        webPreferences: {
            nodeIntegration: true
        }
    });

    addProjectWindow.loadFile('src/view/page/conun/addproject.html');

    addProjectWindow.once('ready-to-show', () => {
        addProjectWindow.show()
    });

    addProjectWindow.webContents.openDevTools();

    addProjectWindow.on('closed',  () => {
        addProjectWindow = null
    })
}

function WelcomingWindow() {
    // createTray()
    console.log('Welcome Window Frame Started');
    mainWindow = new BrowserWindow({
        width: 1024, height: 780,
        maxWidth: 1024, maxHeight: 780,
        minWidth: 1024, minHeight:780,
        backgroundColor: '#2e2c29',
        webPreferences: {
            nodeIntegration: true,
            // devTools: false
        }
    });
    mainWindow.webContents.openDevTools();
    mainWindow.loadFile('src/view/page/access/intro.html');

    mainWindow.on('closed',  () => {
        mainWindow = null
    });
}


function MobileWindow() {
    console.log('Mobile Window Frame Started');
    mobileWindow = new BrowserWindow({
        width: 400, height: 800,
        maxWidth: 400, maxHeight: 800,
        minWidth: 400, minHeight:800,
        frame: false,
        parent: mainWindow,
        modal: false,
        webPreferences: {
            nodeIntegration: true,
            // devTools: false
        }
    });

    // Load index.html into the new BrowserWindow
    mobileWindow.loadFile('src/mobile.html');

    // Open DevTools - Remove for PRODUCTION!
    mobileWindow.webContents.openDevTools();

    // Listen for window being closed
    mobileWindow.on('closed',  () => {
        mobileWindow = null
    })
}

function MainWindow() {
    console.log('Main Window Frame Started');

    mainWindow = new BrowserWindow({

        width: 1024, height: 780,
        maxWidth: 1024, maxHeight: 780,
        minWidth: 1024, minHeight:780,
        backgroundColor: '#2e2c29',
        show: false,
        webPreferences: {
            nodeIntegration: true,
            // devTools: true
        }
    });

    // Load index.html into the new BrowserWindow
    mainWindow.loadFile('src/view/page/home.html');

    // Open DevTools - Remove for PRODUCTION!
    mainWindow.webContents.openDevTools();
    // Listen for window being closed

    // todo always on mode
    // mainWindow.setAlwaysOnTop(true, "floating");
    // mainWindow.setVisibleOnAllWorkspaces(true);
    // mainWindow.setFullScreenable(false);

    mainWindow.on('closed',  () => {
        mainWindow = null
    })

    electron.powerMonitor.on('resume', e => {
        if(!mainWindow) createWindow()
    })

    electron.powerMonitor.on('suspend', e => {
        console.log('Saving some data ...')
        //TODO Save into DB
    })

    mainWindow.once('ready-to-show', () => {
        // initAutoUpdate();
        mainWindow.show();
    });
}

function createWindow () {
    console.log('Checking ready: ' + app.isReady());
    if(mainStore.get('window_state') !== 'main') {
        WelcomingWindow();
    } else if(mainStore.get('window_state') === 'main') {
        MainWindow();
    } else if(mainStore.get('window_state') === 'mobile') {
        MobileWindow();
    }
}

module.exports = {
    mainWindow, mobileWindow, qrCodeChildWindow, addProjectWindow, tray, popUpChildWindow,
    createWindow, QrCodeChildWindow, PopUpChildWindow
}