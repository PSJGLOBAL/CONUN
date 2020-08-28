const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const FileSaver = require('file-saver');
const {AccountSession} = require('../_ui.objects');
//walletReduce

const { createStore, applyMiddleware } = require('redux');
const {
    forwardToMain,
    replayActionRenderer,
    getInitialStateRenderer,
    createAliasedAction,
} = require('electron-redux');
const { networkReduce } = require('../../app/event/_app.event.manager');

const initialState = getInitialStateRenderer();
const store = createStore(networkReduce, initialState, applyMiddleware(forwardToMain));
replayActionRenderer(store);


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
                console.log (jsonFile);
            };
        }
        catch (e) {
            console.log(e);
            new Notification( 'CONUN Manager', {
                body: 'Unexpected JSON format',
            });
        }
        reader.readAsText(files[0]);
    }


    var ctrlCreateWallet = function () {
        let password;
        console.log('ctrlCreateWallet');

        const importJsonPromise = new Promise(
            function (resolve, reject) {
                password = UICtrl.getInput();
                if(password !== '') {
                    console.log(password);
                    console.log(jsonFile);
                    ipcRenderer.send('WEB3_CHANNEL',
                        {
                            CMD: 'IMPORT_NEW_JSON_KEYSTORE_REQ',
                            data: {
                                json_keystore: jsonFile,
                                password_import: password.wallet_password,
                            }
                        });
                    console.log('ActivateWallet 1: ', true);
                    resolve(true);
                } else {
                    console.log('Promise false');
                    reject(false);
                }
            }
        );

        importJsonPromise.then(ActivateWallet)
            .catch(function (error) {
                console.log(error);
            })
    };


    async function ActivateWallet() {
        await ipcRenderer.on('WEB3_LISTENER', (e, arg) => {
            if(arg.CMD === 'IMPORT_NEW_JSON_KEYSTORE_RES') {
                let data_json = {
                    wallet_address: arg.data.address,
                    private_key: arg.data.privateKey
                };
                store.dispatch({ type: 'TAG_CHANGE_WALLET_ADDR', payload: data_json});
                window.close();
            }
        });
    }

    return {
        init: function() {
            console.log('Application has started. ');
            setupEventListeners();
        }
    };

})(KeyStoreController);

controller.init();
