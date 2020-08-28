const { dialog } = require('electron');
const { autoUpdater } = require('electron-updater')
const isDev = require('electron-is-dev')
const logger = require('./logger')
const restart = require('./electron-restart')
const {config} = require('../../../private/config/project.settings');

autoUpdater.setFeedURL({
        provider: config().release.provider,
        repo: config().release.repo,
        owner: config().release.owner,
        private: config().release.private,
        token: config().release.token
});


if (isDev) {
        process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true
}


function showUpdateNotification (info = {}) {

        let versionLabel = info.label
            ? `Version ${info.version}`
            : 'The latest version'


        const options = {
                type: 'question',
                buttons: ['Restart Now', 'Later!'],
                defaultId: 2,
                title: 'The latest version was install',
                message: 'Conun Manager will be automatically updated after restart.',
                detail: `${versionLabel} was installed`
        };

        dialog.showMessageBox(null, options, () => {
        }).then(function (res) {
                if(res.response === 0) {
                        logger.warn('Reloading...');
                        autoUpdater.quitAndInstall()
                }
        });
}

function showUpdateAvailableNotification (info = {}) {

        logger.info('Update available.');

        const options = {
                type: 'info',
                buttons: ['Update', 'No'],
                defaultId: 2,
                title: 'New Update Available',
                message: 'Will you update new version?',
        };

        dialog.showMessageBox(null, options, () => {
        }).then(function (res) {
                if(res.response === 0) {
                        logger.warn('Updating...');
                        autoUpdater.downloadUpdate()
                }
        });
}


function initAutoUpdate () {
        logger.info('App starting...|');
        if (isDev) {
                logger.info('Running in development');
        } else {
                logger.info('Running in production');
        }

        if(isDev) {
                return
        }

        autoUpdater.on('checking-for-update', () => logger.info('Checking for update...'))
        autoUpdater.on('update-available', info => showUpdateAvailableNotification(info))
        autoUpdater.on('download-progress', function (progressObj) {
                try {
                        let msg = `Download speed: ${progressObj.bytesPerSecond}`
                        msg += ` - Downloaded ${progressObj.percent}%`
                        msg += ` (${progressObj.transferred}/${progressObj.total})`
                        logger.info(msg)
                } catch (e) {
                      logger.error('While download: ', e);
                }
        })
        autoUpdater.on('update-downloaded', info => showUpdateNotification(info))
        autoUpdater.on('update-not-available', () => logger.info('Update not available.'))
        autoUpdater.on('error', err => logger.error(`Error in auto-updater. ${err}`))

        autoUpdater.checkForUpdates()
            .catch(function (err) {
                    logger.warn('Could not find updates', err.message)
            })
}

module.exports = { initAutoUpdate }
