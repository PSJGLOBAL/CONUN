const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const {AccountSession} = require('../_ui.objects');
const { createStore, applyMiddleware } = require('redux');
const {
    forwardToMain,
    replayActionRenderer,
    getInitialStateRenderer,
    createAliasedAction,
} = require('electron-redux');
const {networkReduce} = require('../../app/event/_app.event.manager');

const initialState = getInitialStateRenderer();
const store = createStore(networkReduce, initialState, applyMiddleware(forwardToMain));
replayActionRenderer(store);

const ImportPrivateKey = (function () {
    var UIGet = function () {
        let DOMStrings = {
            intWalletPk: '.int_wallet_pk',
            btnAccessWallet: '.btn_access_wallet'
        };
        return {
            getInput: function() {
                return {
                    privateKey: document.querySelector(DOMStrings.intWalletPk).value,
                };
            },
            getDOMStrings: function () {
                return DOMStrings;
            }
        }
    };

    var setupEventListeners = function () {
        var DOM = UIGet().getDOMStrings();
        document.querySelector(DOM.btnAccessWallet).addEventListener('click', AccessWallet);
    };

    function AccessWallet() {
        console.log('AccessWallet clicked');

        const importPrivateKeyPromise = new Promise(
            function (resolve, reject) {
                let intPrivateKey = UIGet().getInput();
                console.log(intPrivateKey);
                console.log(typeof intPrivateKey);

                ipcRenderer.send('WEB3_CHANNEL',
                    {
                        CMD: 'IMPORT_PRIVATE_KEY_REQ',
                        data: intPrivateKey
                    });
                console.log('check promise 1: ', intPrivateKey);
                resolve(intPrivateKey);
            }
        );

        importPrivateKeyPromise.then(function (intPrivateKey) {
            ipcRenderer.on('WEB3_LISTENER', (e, arg) => {
                console.log('check promise 2: ', arg, intPrivateKey);
                if(arg.CMD === 'IMPORT_NEW_PRIVATE_KEY_RES') {
                    let data_json = {
                        wallet_address: arg.data,
                        private_key: intPrivateKey
                    };
                    store.dispatch({type: 'TAG_CHANGE_WALLET_ADDR', payload: data_json});
                    console.log('IMPORT_NEW_PRIVATE_KEY_RES exit');
                    window.close();
                }
            });
        })
    }

    return {
        init: function () {
            console.log('Application Started. ');
            setupEventListeners();
        }
    };
})();

ImportPrivateKey.init();
