const electron = require('electron');
const ipcMain = electron.ipcMain;
const web3Event = require('./eth.main');
// const fork = require('child_process').fork;
// const web3Process = fork('./eth.main.js');

const WEB3_CHANNEL = 'WEB3_CHANNEL';
const WEB3_LISTENER = 'WEB3_LISTENER';
const CREATE_ACCOUNT = 'CREATE_ACCOUNT';
const IMPORT_PRIVATE_KEY_REQ = 'IMPORT_PRIVATE_KEY_REQ';
const IMPORT_JSON_KEYSTORE_REQ = 'IMPORT_JSON_KEYSTORE_REQ';
const IMPORT_NEW_JSON_KEYSTORE_REQ = 'IMPORT_NEW_JSON_KEYSTORE_REQ';
const CHECK_BALANCE_OF = 'CHECK_BALANCE_OF';
const SEND_ETH_TRANSACTION = 'SEND_ETH_TRANSACTION';
const SEND_CON_TRANSACTION = 'SEND_CON_TRANSACTION';
const ESTIMATE_NETWORK_FEE = 'ESTIMATE_NETWORK_FEE';
const GET_TX_RECEIPT = 'GET_TX_RECEIPT';



// function onExit() {
//     web3Process.kill('SIGINT');
//     process.exit(0);
// }
//
// process.on('exit', onExit);

// web3Process.on('message', (res) => {
//     console.log('>>web3Process Get >>> 1: ', res);
// });

// const makeWeb3Listener = new Promise (
//     function (resolve) {
//         web3Process.on('message', (res) => {
//             console.log('web3Listener Get: ', res);
//             resolve(res);
//         });
//     }
// );
// put in main.js
//  web3Handlers.makeWeb3Listener.then(data => {
//     console.log('WEB3_LISTENER>> send: ', data);
//     e.sender.send('WEB3_LISTENER', data);
// });
//

// web3Event.on('res-web3-event', (res) => {
//     console.log('>>web3Process Get ORG>>> : ', res);
//
// });



module.exports = {
    web3Event,

    web3Service:(CMD, data) => {
        console.log('web3Service: ', CMD, data);
        try {
            switch (CMD) {
                case 'CREATE_ACCOUNT': {
                    web3Event.emit('req-web3-event', {type: CREATE_ACCOUNT, payload: data});
                    break;
                }

                case 'IMPORT_PRIVATE_KEY_REQ': {
                    web3Event.emit('req-web3-event', {type: IMPORT_PRIVATE_KEY_REQ, payload: data});
                    break;
                }

                case 'IMPORT_JSON_KEYSTORE_REQ': {
                    web3Event.emit('req-web3-event', {type: IMPORT_JSON_KEYSTORE_REQ, payload: data});
                    break;
                }

                case 'IMPORT_NEW_JSON_KEYSTORE_REQ': {
                    web3Event.emit('req-web3-event', {type: IMPORT_NEW_JSON_KEYSTORE_REQ, payload: data});
                    break;
                }


                case  'CHECK_BALANCE_OF': {
                    web3Event.emit('req-web3-event', {type: CHECK_BALANCE_OF, payload: data});
                    break;
                }

                case  'SEND_ETH_TRANSACTION': {
                    web3Event.emit('req-web3-event', {type: SEND_ETH_TRANSACTION, payload: data});
                    break;
                }

                case  'SEND_CON_TRANSACTION': {
                    web3Event.emit('req-web3-event', {type: SEND_CON_TRANSACTION, payload: data});
                    break;
                }

                case  'ESTIMATE_NETWORK_FEE': {
                    web3Event.emit('req-web3-event', {type: ESTIMATE_NETWORK_FEE, payload: data});
                    break;
                }

                case  'GET_TX_RECEIPT': {
                    web3Event.emit('req-web3-event', {type: GET_TX_RECEIPT, payload: data});
                    break;
                }

                default:
                    throw new Error('Unrecognized CMD received by WEB3_CHANNEL MANAGER. Please check ipcChannelManager()');
            }
        } catch (e) {
            console.log(e);
        }
    }
};

