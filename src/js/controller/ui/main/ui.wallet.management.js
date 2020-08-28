const electron = require('electron');
const { ipcRenderer } = electron;
const {AccountSession} = require('../_ui.objects');
const { active_account, checkBalance,
    appListener} = require('./_ui.main');
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


var walletManagerUIController = (function () {

    var DOMStrings = {
        setNetworkStatus: 'txt_network_status',
        setTxtNodeCount: 'txt_node_count',
        seTextWalletAddr: 'userwallet',
        setTextConunBalance: 'txt_con_balance',
        setlectBalance: 'txt_wallet_1',
        btnImportWallet: 'btn_import_wallet',
        btnExportQrCode: 'btn_export_qr_code',
        btnApplyWallet: 'btn_apply_wallet'
    };

    return {
        displayWallet: function() {
            console.log('Manage display >>');
            let account = active_account();
            document.getElementById(DOMStrings.setNetworkStatus).innerHTML = appListener().getApp('network_status');
            document.getElementById(DOMStrings.setTxtNodeCount).innerHTML = appListener().getApp('online_nodes');
            document.getElementById(DOMStrings.seTextWalletAddr).value = account.wallet_address;
            document.getElementById(DOMStrings.setTextConunBalance).value = appListener().getApp('coin_con');
            // document.getElementById(DOMStrings.setTextEtherBalance).innerText = appListener().getApp('coin_eth');
            if(appListener().getApp('wallet_address'))
                document.getElementById(DOMStrings.setlectBalance).innerHTML = appListener().getApp('wallet_address');
            else
                document.getElementById(DOMStrings.setlectBalance).innerHTML = account.wallet_address;
        },

        tempDisplay: function() {
            document.getElementById(DOMStrings.setlectBalance).innerHTML = appListener().getApp('wallet_address');
        },

        getDOMstrings: function () {
            return DOMStrings;
        }
    }

})();

var setController = (function (UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();

        document.getElementById(DOM.btnImportWallet).addEventListener('click', function () {
            console.log('Click import_wallet');
            ipcRenderer.send('OPEN_CHILD_WINDOW', {CMD: 'pup_up_window_open', data: {
                    width: 400,
                    height: 720,
                    viewBox: 'import_wallet.html',
                    object: true
                }
            });
        });

        document.getElementById(DOM.btnExportQrCode).addEventListener('click', function () {
            console.log('Click export_qr');
            ipcRenderer.send('OPEN_CHILD_WINDOW', {CMD: 'pup_up_window_open', data: {
                    width: 400,
                    height: 720,
                    viewBox: 'export_qr.html',
                    object: true
                }
            });
        });

        document.getElementById(DOM.btnApplyWallet).addEventListener('click', AccountCreateRequest)
    };


    //
    function AccountCreateRequest() {
        AccountSession.setModel({
            wallet_address: appListener().getApp('wallet_address'),
            private_key: appListener().getApp('private_key')
        });
        let data = AccountSession.getModel();
        const ACCOUNT_CREATE_REQ = {
            msgType: 'CHANGE_WALLET_ADDR_REQ',
            auth_token: data.auth_token,
            data: {
                node_uid: data.node_uid,
                wallet_address: data.wallet_address,
            }
        };
        ipcRenderer.send('CORE_CHANNEL', ACCOUNT_CREATE_REQ);
    }


    ipcRenderer.on('CORE_LISTENER', (event, arg) => {
        if(arg.msgType === 'CHANGE_WALLET_ADDR_RES' && arg.data.message === 'success') {
            let data = AccountSession.getModel();
            store.dispatch({ type: 'TAG_CHANGE_WALLET_ADDR', payload: data.wallet_address});
        }

        else if(arg.msgType === 'CHANGE_WALLET_ADDR_RES' && arg.data.message === 'duplicated wallet address') {
            new Notification( 'Duplicated Wallet address', {
                body: 'Someone else using current wallet address\rPlease check and try again'
            });
        }

        else {
            new Notification( 'Import Fail', {
                body: 'Please check your network connection\rand try again'
            });
        }

        checkBalance();
    });
    //



    return {
        init: function () {
            console.log('Wallet Manager has started !');
            checkBalance();
            setupEventListeners();
            UICtrl.displayWallet();
            store.subscribe(UICtrl.displayWallet);

        }
    };
})(walletManagerUIController);

setController.init();


