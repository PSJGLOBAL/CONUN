const electron = require('electron');
const {shell, ipcRenderer} = electron;
const { uiEventHandler, Eth_sendTransaction, Con_sendTransaction, checkBalance} = require('../main/_ui.main');
const {AccountSession} = require('../_ui.objects');
const {onward} = require('../../app/api/io.router.protocol');
var TransactionUIController = (function () {

    var DOMStrings = {
        setTaskId: 'txt_task_id',
        setToAddress: 'txt_to_address',
        setSendAmount: 'txt_send_amount',
        setTransactionFee: 'txt_transaction_fee',
        btnEtherScan: 'btn_etherscan',
        btnOk: 'btn_ok'
    };

    return {
        displayTransaction: function(object) {
            if(object.task_id)document.getElementById(DOMStrings.setTaskId).innerHTML = object.task_id;
            if(object.to_address)document.getElementById(DOMStrings.setToAddress).innerHTML = object.to_address;
            if(object.task_fee)document.getElementById(DOMStrings.setSendAmount).innerHTML = object.task_fee;
            if(object.transaction_fee)document.getElementById(DOMStrings.setTransactionFee).innerHTML = object.transaction_fee;
        },

        getDOMstrings: function () {
            return DOMStrings;
        }
    }
})();



var mainController = (function (TransUICtrl) {
    const reword_object = {
        tx_hash: null,
        task_id: null,
        valid: false
    };

    var setupEventListeners = function () {
        var DOM = TransUICtrl.getDOMstrings();
        document.getElementById(DOM.btnEtherScan).addEventListener('click', function () {
            if(reword_object.valid === true)
            shell.openExternal('https://ropsten.etherscan.io/tx/' + reword_object.tx_hash);
        });
        document.getElementById(DOM.btnOk).addEventListener('click', function () {
            checkBalance();
            window.close();
        });
    };

    uiEventHandler.on('reward-tx-result', function (args) {
        reword_object.tx_hash = args;
        reword_object.valid = true;
        TransUICtrl.displayTransaction({
            transaction_fee: reword_object.tx_hash // tx_hash
        });
        let data = AccountSession.getModel();
        onward.request = {
            msgType: 'REWARD_SEND_RES',
            auth_token: data.auth_token,
            data: {
                task_id: reword_object.task_id,
                tx_hash: reword_object.tx_hash,
                status: args.status
            }
        };
    });


    uiEventHandler.on('reward-send-emit', function (args) {
        let data = AccountSession.getModel();

        if (args.coin_type === '0') {
            Eth_sendTransaction({
                from_address: data.wallet_address,
                private_key: data.private_key,
                to_address: args.wallet_address,
                value: args.coin_value,
                gasLimit: '',
                gasPrice: '',
                type: 'default'
            });
        } else if (args.coin_type === '1') {
            Con_sendTransaction({
                from_address: data.wallet_address,
                private_key: data.private_key,
                to_address: args.wallet_address,
                value: args.coin_value,
                gasLimit: '',
                gasPrice: '',
                type: 'default'
            });
        }

        TransUICtrl.displayTransaction({
            task_id: args.task_id,
            to_address: args.wallet_address,
            task_fee: args.coin_value,
        });

        reword_object.task_id = args.task_id;
        reword_object.valid = false;
    });

    return {
        init: function () {
            setupEventListeners();
            TransUICtrl.displayTransaction({
                task_id: '',
                to_address: '',
                task_fee: '',
                transaction_fee: ''
            });
        }
    }

})(TransactionUIController);

mainController.init();