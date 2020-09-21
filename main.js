const electron = require('electron');
const {app} = electron;
const ipcMain = electron.ipcMain;
const { dialog } = require('electron');
const {shell} = require('electron');
const { createWindow, mainWindow } = require('./src/service/main.app');
const P2PM = require('./src/service/main.p2p');
const { mainToMainChannel } = require('./src/service/main.hub')

app.on('ready', () => {
    createWindow();
    console.log('App is Ready?');
    require('./src/service/main.channel');
    P2PM.init();
    shell.beep();
});

app.on('before-quit', e => {
    console.log('Preventing app from quitting!')
    mainToMainChannel.emit('QUIT_EVENT')
    setTimeout(function () {
        if (process.platform !== 'darwin') app.quit()
    }, 3000)
})

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
    if (mainWindow === null) createWindow()
});