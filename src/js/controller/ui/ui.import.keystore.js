const { eventHunter, dispatchEvent } = require('conun-ipc/middleware/renderer.event.hunter');
const FileSaver = require('file-saver');

var KeyStoreController = (function () {
    var DOMStrings = {
        intWalletPassword:'.int_wallet_password',
        btnWalletPassword:'.btn_wallet_password',
        userFileClick: 'userfile'
    };

    return {
        getInput: function () {
            return {
                wallet_password: document.querySelector(DOMStrings.intWalletPassword).value
            };
        },

        getDOMstrings: function () {
            return DOMStrings;
        }
    }
})();

function keyPressListener(callback) {
    document.addEventListener('keypress', function(event) {
        if (event.keyCode === 13 || event.which === 13) {
            callback();
        }
    });
}

var controller = (function (UICtrl) {
    var jsonFile = null;
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();

        document.getElementById(DOM.userFileClick).addEventListener('change', jsonReadFile, false);
        document.querySelector(DOM.btnWalletPassword).addEventListener('click', ctrlCreateWallet);
        keyPressListener(ctrlCreateWallet)
    };

    function jsonReadFile(evt) {
        var files = evt.target.files;
        var reader = new FileReader();
        try {
            reader.onload = function () {
                jsonFile = JSON.parse(reader.result);
            };
        }
        catch (e) {
            new Notification( 'CONUN Manager', {
                body: 'Unexpected JSON format',
            });
        }
        reader.readAsText(files[0]);
    }

    var ctrlCreateWallet = function () {
        console.log('ctrlCreateWallet');
        var password = UICtrl.getInput();
        password = password.wallet_password
        if(password.length && jsonFile) {
            eventHunter.WEB3_CHANNEL_REQ = {
                event: 'GET_WALLET_WITH_JSON_KEYSTORE',
                value: {
                    CMD: 'IMPORT_JSON_KEYSTORE_REQ',
                    data: {
                        json_keystore: jsonFile,
                        password_import: password,
                    }
                }
            }
        }
    };

    dispatchEvent.listener.on('IMPORT_JSON_KEYSTORE_RES', function(response) {
        if(response.wallet_address)
            window.location.href = '../../../view/page/home.html';
    });

    return {
        init: function() {
            console.log('Application has started. ');
            setupEventListeners();
            dispatchEvent.init('WEB3_CHANNEL_RES')
        }
    };

})(KeyStoreController);

controller.init();
