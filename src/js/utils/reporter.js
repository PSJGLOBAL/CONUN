const { crashReporter } = require('electron');
const request = require('request');
const manifest = require('../../../package');
const host = 'http://54.180.92.51:8000';
// const host = 'http://localhost:3000';
const Store = require('electron-store');
const mainStore = new Store();

const config = {
    productName: "Conun Manager",
    companyName: manifest.author.name,
    submitURL: host + '/api/v1/crashreports',
    uploadToServer: true,
};

crashReporter.start(config);

const sendUncaughtException = error => {
    console.log('>>> sendUncaughtException >>>')
    // let {appLocation} = require('../controller/ui/main/ui.main');
    let node_uid = mainStore.get('node_uid');
    const { productName, companyName } = config;
    request.post(host + '/api/v1/uncaughtexceptions', {
        form: {
            productName: productName,
            companyName: companyName,
            version: manifest.version,
            platform: process.platform,
            process_type: process.type,
            ver: process.versions.electron,
            node_uid: node_uid,
            // appLocation: appLocation.getDefine(),
            appLocation: 'none',
            error_name: error.name,
            error_message: error.message,
            error_stack: error.stack
        },
    });
};

function LogReporter(message) {
    let {appLocation} = require('../controller/ui/main/_ui.main');
    let node_uid = mainStore.get('node_uid');
    const { productName, companyName } = config;
    request.post(host + '/api/v1/log', {
        form: {
            productName: productName,
            companyName: companyName,
            version: manifest.version,
            platform: process.platform,
            process_type: process.type,
            ver: process.versions.electron,
            node_uid: node_uid,
            appLocation: appLocation.getDefine(),
            error_name: 'logger',
            error_message: JSON.stringify(message),
        },
    });
}
console.log('process: ', process.type);

if (process.type === 'browser') {
    process.on('uncaughtException', sendUncaughtException);
}
else {
    window.addEventListener('error', sendUncaughtException);
}

console.log('[INFO] Crash reporting started.', crashReporter);


// process.on('unhandledRejection', function (err) {
//     console.log('>> 1 >>', err);
// })
// process.on('rejectionHandled', function (err) {
//     console.log('>> 2 >>', err);
// })
// process.on('uncaughtExceptionMonitor', function (err) {
//     console.log('>> 3 >>', err);
// })
//
// process.on('warning', (warning) => {
//     console.log('>> 4 >>');
//     console.log(warning.name);
//     console.log(warning.message);
//     console.log(warning.code);
//     console.log(warning.stack);
// });

module.exports = {crashReporter, LogReporter};

