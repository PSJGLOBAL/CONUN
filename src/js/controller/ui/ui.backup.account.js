const FileSaver = require('file-saver');
const { ipcDispatcher } = require('conun-ipc/middleware/ipcRenderer.poster');
const { windowDispatcher } = require('conun-ipc/middleware/multi.window.poster');
const { eventHunter } = require('conun-ipc/middleware/renderer.event.hunter');
const {ApplicationStorage} = require('./ui.objects')
const crypto = require('crypto');

var AccountUIController = (function () {

    var DOMStrings = {
        seTextWalletAddr: 'userwallet',
        seTextWalletPk: 'wallet_pk',

        btnJsonWalletKeyExpo: '.btn_jsonWalletKey_expo',
        btnBeckUpQrCode: '.btn_qrCode_expo',
        btnHomeAccess: '.btn_next_home'
    };

    return {
        displayWallet: function (data) {
            console.log('displayWallet: ', data)
            document.getElementById(DOMStrings.seTextWalletAddr).value = data.wallet_address;
            document.getElementById(DOMStrings.seTextWalletPk).value = data.wallet_private_key;
        },

        getDOMstrings: function () {
            return DOMStrings;
        },

        accountService: async function () {
            eventHunter.DATABASE_CHANNEL_REQ = {
                event: 'GET_ACCOUNT_ADDR',
                value: {
                    id: 1
                }
            }
            return eventHunter.DATABASE_CHANNEL_RES;
        },
    };

})();



(async (UICtrl, ) => {
    let account = await UICtrl.accountService()
    UICtrl.displayWallet({
        wallet_address: account.value.wallet_address,
        wallet_private_key: account.value.wallet_private_key
    });
    ApplicationStorage.setModel('APP_WALLET_ADDR', JSON.stringify({wallet_address: account.value.wallet_address}));
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.btnJsonWalletKeyExpo).addEventListener('click', jsonSaveFile);
        document.querySelector(DOM.btnBeckUpQrCode).addEventListener('click', QrCodeBackUp);
        document.querySelector(DOM.btnHomeAccess).addEventListener('click', function () {
            ipcDispatcher.OPEN_POPUP_WINDOW = {
                width: 450,
                height: 400,
                viewBox: 'wallet03.html',
                frame: false
            }
        });
    };

    function QrCodeBackUp() {
        let key = crypto.createCipher('aes-128-cbc', account.value.password);
        let encrypt = key.update(JSON.stringify({
            wallet_address: account.value.wallet_address,
            wallet_private_key: account.value.wallet_private_key,
        }), 'utf8', 'base64');
        encrypt += key.final('base64');
        console.log('encrypt: ', encrypt);
        windowDispatcher.QR_CODE_SHARE = encrypt;
        ipcDispatcher.QR_CODE_WINDOW = {CMD: 'qr_code_window_open'};
    }

    function jsonSaveFile() {
        console.log('jsonSaveFile clicked')
        let filename = new Date();
        let blob = new Blob([account.value.wallet_jsonKeystore], {type: "text/plain;charset=utf-8"});
        saveAs(blob, filename + ".json");
    }

    setupEventListeners();

    let resp = await ipcDispatcher.OPEN_MAIN_WINDOW;
    console.log('OPEN_MAIN_WINDOW_RES: ', resp)
    if ('app-ready-event' === resp) {
        window.location.href = '../../../view/page/home.html';
    }

})(AccountUIController);
