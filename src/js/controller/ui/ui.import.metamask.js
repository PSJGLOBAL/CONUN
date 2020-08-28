const electron = require('electron');
const {shell, ipcRenderer} = electron;
// const Web3 = require('web3');
const {AccountSession} = require('./_ui.objects');

// TODO Thsi is tested for metamask connection
// TODO make ipc main an render process .js for metaporting.html
// TODO shell.openExternal(`http://localhost:63342/conun_manager_v1/src/view/metaporting.html`);

var importMetamask = (function() {

    var setUpListener = function() {
        //document.querySelector('.btn_open_metamask').addEventListener('click', connectMetamask);
    };

    // window.webContents.on('new-window', function(e, url) { https://stackoverflow.com/questions/32402327/how-can-i-force-external-links-from-browser-window-to-open-in-a-default-browser?lq=1
    //     // make sure local urls stay in electron perimeter
    //     if('file://' === url.substr(0, 'file://'.length)) {
    //         return;
    //     }
    //
    //     // and open every other protocols on the browser
    //     e.preventDefault();
    //     shell.openExternal(url);
    // });

    var connectMetamask = function() {
        //TODO ipc render to ws channel
        ipcRenderer.send('WS_CHANNEL', {CMD: 'INIT_WS'});
        shell.openExternal(`http://localhost:63342/manager-electron/src/view/page/chrome/metaporting.html`);

        setTimeout(function () {
            // ipcRenderer.send('WS_CHANNEL', {CMD: 'WS_SEND', data: {msg: 'from server'}});
            ipcRenderer.send('WS_CHANNEL', {CMD: 'WS_SEND', data: {msgType:'META_IMPORT_WALLET_REQ' }});
        },1000)
    };

    ipcRenderer.on('import-metamask-wallet', (event, args) => {
        console.log('import-metamask-wallet: ', args);
        if(args.msgType === 'META_IMPORT_WALLET_RES' && args.data.wallet_address !== 'undefined') {
            AccountSession.setModel({
                wallet_address: args.data.wallet_address
            });
            AccountCreateRequest();
        }
    });


    ipcRenderer.on('CORE_LISTENER', (event, arg) => {
        console.log('CORE_LISTENER -> ACCOUNT_CREATE_RES', arg);
        if(arg.msgType === 'ACCOUNT_CREATE_RES' && arg.data.message === 'success') {
            AccountSession.setModel({
                auth_token: arg.data.auth_token,
            });
            window.location.href = '../../../view/page/home.html';
        }
        else {
            new Notification( 'Connection Fail', {
                body: 'Please check your network connection\rand try again'
            });
        }
    });


    function AccountCreateRequest() {
        let data = AccountSession.getModel();
        const ACCOUNT_CREATE_REQ = {
            msgType: 'ACCOUNT_CREATE_REQ',
            data: {
                node_uid: data.node_uid,
                wallet_address: data.wallet_address,
            }
        };
        ipcRenderer.send('CORE_CHANNEL', ACCOUNT_CREATE_REQ);
    }
    return {
        init: function () {
            console.log('Application has started. ');
            setUpListener();
        }
    }
})();

importMetamask.init();
