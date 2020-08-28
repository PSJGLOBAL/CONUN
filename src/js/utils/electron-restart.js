const { app } = require('electron')

function restart (status = 0) {
    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
    app.exit(status)
    return {}
}

module.exports = restart



////


const { autoUpdater} = require('electron-updater')
const { dialog, BrowserWindow, ipcMain } = require('electron')

autoUpdater.logger = require('electron-log')
autoUpdater.logger.transports.file.level = "info"

// Disable auto downloading
autoUpdater.autoDownload = false;
exports.check = () => {
    autoUpdater.checkForUpdates()

    // Listen for download found
    autoUpdater.on('update-available', () => {
        //Track progress percent
        let downloadProgress = 0

        dialog.showMessageBox({
            type: 'info',
            title: 'Actualización disponible',
            message: 'Nueva versión es disponible. ¿Quieres descargarla ahora?',
            buttons: [
                'Update',
                'No'
            ]
        }, (buttonIndex) => {
            if(buttonIndex !== 0) {
                return
            }
            // Start download an show progress
            autoUpdater.downloadUpdate()

            //Progress window
            let progressWin = new BrowserWindow({
                width: 350,
                height: 35,
                useContentSize: true,
                autoHideMenuBar: true,
                maximizable: false,
                fullscreen: false,
                fullscreenable: false,
                resizable: false
            })
            autoUpdater.logger.info('despues de ventana de progress')

            progressWin.loadURL(`file://${__dirname}/renderer/progress.html`)
            progressWin.on('close', () => {
                progressWin = null
            })
            autoUpdater.on('download-progress', (d) => {
                autoUpdater.logger.info('download progress', d)
                downloadProgress = d.percent
            })

            ipcMain.on('download-progress-request', (e) => {
                e.returnValue = downloadProgress
            })

            autoUpdater.on('update-downloaded', () => {
                // close progresswindow
                if(progressWin) progressWin.close()
                dialog.showMessageBox({
                    type: 'info',
                    title: 'Descargado',
                    message: 'Nueva versión descargada',
                    buttons: ['Yes', 'Later']
                }, (buttonIndex) => {
                    if (buttonIndex === 0) autoUpdater.quitAndInstall()
                })

            })
        })
    })
}
