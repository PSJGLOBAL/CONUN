const {active_account, checkBalance, appListener, Eth_sendTransaction,
    Con_sendTransaction, uiEventHandler, estimateNetworkFee} = require('./_ui.main');
const {AccountSession, ApplicationSession} = require('../_ui.objects');
const {onward} = require('../../app/api/io.router.protocol');

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



var transUIController = (function () {
    let DOMStrings = {
        setNetworkStatus: 'txt_network_status',
        setTxtNodeCount: 'txt_node_count',
        seTextWalletAddr:'userwallet',
        setTextBalance: 'text_balance',

        btnRefreshBalance: 'btn_refreshBalance',
        selectCoinType: 'to_type',

        intTransferAmount: 'tr_amount',
        intToAddress: 'to_addr',

        btnSelected: {
            slowTransaction: 'btn_slow_transaction',
            averageTransaction: 'btn_average_transaction',
            fastTransaction: 'btn_fast_transaction',
            advancedTransaction: '.btn_advanced_transaction'
        },

        txtSelected: {
            slowTransaction: 'slow_transaction',
            averageTransaction: 'average_transaction',
            fastTransaction: 'fast_transaction',
        },

        btnAdvancedView: 'button_value',

        intGasPrice: 'txt_gas_price',
        intGasLimit: 'txt_gas_limit',
        transactionFee: 'txt_transaction_fee',
        totalFee: 'txt_total',
        btnSendTransaction: 'btn_send_transaction',


    };

    return {
        displayAll: function() {
            console.log('Wallet display >>');
            let account = active_account();
            document.getElementById(DOMStrings.setNetworkStatus).innerHTML = appListener().getApp('network_status');
            document.getElementById(DOMStrings.setTxtNodeCount).innerHTML = appListener().getApp('online_nodes');
            document.getElementById(DOMStrings.seTextWalletAddr).value = account.wallet_address;
            $("#text_balance").val(appListener().getApp(document.getElementById(DOMStrings.selectCoinType).value));
        },

        displayNetworkFee: function(value) {
            console.log('Wallet display >>');
            document.getElementById(DOMStrings.txtSelected.fastTransaction).innerHTML  = value.fast;
            document.getElementById(DOMStrings.txtSelected.averageTransaction).innerHTML = value.average;
            document.getElementById(DOMStrings.txtSelected.slowTransaction).innerHTML = value.slow;
        },


        displayAdvancedView: function(value) {
            console.log('Wallet display >>', value);
            if(value.gas_price) document.getElementById(DOMStrings.intGasPrice).value  = value.gas_price;
            if(value.gas_limit) document.getElementById(DOMStrings.intGasLimit).value = value.gas_limit;
            if(value.transaction_fee) document.getElementById(DOMStrings.transactionFee).innerHTML = value.transaction_fee;
            if(value.total_fee) document.getElementById(DOMStrings.totalFee).innerHTML = value.total_fee;
        },

        getInput: function() {
            return {
                transfer_amount: document.getElementById(DOMStrings.intTransferAmount).value,
                to_address: document.getElementById(DOMStrings.intToAddress).value,
                gas_price: document.getElementById(DOMStrings.intGasPrice).value,
                gas_limit: document.getElementById(DOMStrings.intGasLimit).value,
            };
        },

        getDOMstrings: function () {
            return DOMStrings;
        }
    }
})();

var mainController = (function (UICtrl) {
    var transaction = {
           type: null,
           coin_type: null,
           selected_fee: {
               slow: {
                   gas_price: null,
                   gas_limit: null,
                   total: null,
               },
               average: {
                   gas_price: null,
                   gas_limit: null,
                   total: null,
               },
               fast: {
                   gas_price: null,
                   gas_limit: null,
                   total: null,
               }
           }
    };
    var DOM = UICtrl.getDOMstrings();
    var setupEventListeners = function () {
        document.getElementById(DOM.btnRefreshBalance).addEventListener('click', checkBalance);
        document.getElementById(DOM.selectCoinType).addEventListener('change', function () {
            checkBalance();
            transaction.coin_type = $("#to_type").val();
        });

        document.getElementById(DOM.btnSelected.slowTransaction).addEventListener('click', function () {
            transaction.type = document.getElementById(DOM.btnSelected.slowTransaction).value;
            $("#adv").slideUp(300,function() {
                slide_state = true;
                document.getElementById('button_value').innerHTML ="+ Advanced View";
            });
        });
        document.getElementById(DOM.btnSelected.averageTransaction).addEventListener('click', function () {
            transaction.type = document.getElementById(DOM.btnSelected.averageTransaction).value;
            $("#adv").slideUp(300,function(){
                slide_state = true;
                document.getElementById('button_value').innerHTML ="+ Advanced View";
            });
        });
        document.getElementById(DOM.btnSelected.fastTransaction).addEventListener('click', function () {
            transaction.type = document.getElementById(DOM.btnSelected.fastTransaction).value;
            $("#adv").slideUp(300,function(){
                slide_state = true;
                document.getElementById('button_value').innerHTML ="+ Advanced View";
            });
        });
        document.querySelector(DOM.btnSelected.advancedTransaction).addEventListener('click', function () {
            transaction.type = document.querySelector(DOM.btnSelected.advancedTransaction).value;
        });

        $('#to_addr').on('change',function(e) {
            let to_address = $( "#to_addr" ).val();
            console.log('Change get to address: ');
            console.log(to_address.length);
            console.log(to_address);
            if(to_address) checkNetworkFee(to_address);
        });

        $('#txt_gas_price').on('input',function(e) {
            setTimeout(function () {
                let txt_gas_price = $( "#txt_gas_price" ).val();
                let txt_gas_limit = $( "#txt_gas_limit" ).val();
                console.log(txt_gas_price);
                uiCalculation( {
                    gas_price: txt_gas_price,
                    gas_limit: txt_gas_limit
                })
            }, 300);
        });

        $('#txt_gas_limit').on('input',function(e) {
            setTimeout(function () {
                let txt_gas_price = $( "#txt_gas_price" ).val();
                let txt_gas_limit = $( "#txt_gas_limit" ).val();
                console.log(txt_gas_limit);
                uiCalculation( {
                    gas_price: txt_gas_price,
                    gas_limit: txt_gas_limit
                })
            }, 1200)
        });

        $('input#tr_amount').on('input', function(){
            $('span#send_amt').text($(this).val());
            let txt_gas_price = $( "#txt_gas_price" ).val();
            let txt_gas_limit = $( "#txt_gas_limit" ).val();
            console.log(txt_gas_limit);
            uiCalculation( {
                gas_price: txt_gas_price,
                gas_limit: txt_gas_limit
            })
        })

        document.getElementById(DOM.btnSendTransaction).addEventListener('click', function () {
            console.log(transaction.coin_type);
            if(transaction.coin_type === 'coin_eth') {
                ETHSendTransaction();
            }
            else if(transaction.coin_type === 'coin_con') {
                CONSendTransaction();
            }
        });
    };


    var uiCalculation = function (value) {
       var transaction_fee = (value.gas_price * value.gas_limit) / 1000000000;
       var send_amt = $('#tr_amount').val();
       var total = Number(transaction_fee) + Number(send_amt);
        console.log('Total: ', typeof transaction_fee , typeof send_amt, total);
        UICtrl.displayAdvancedView({
            transaction_fee: transaction_fee,
            total_fee: Number(total),
        });
    };

    uiEventHandler.on('estimate-network-fee', function (data) {
        transaction.selected_fee  = {
            slow: {
                gas_price: data.slow.gas_price,
                    gas_limit: data.slow.gas_limit,
                    total: data.slow.total,
            },
            average: {
                gas_price: data.average.gas_price,
                    gas_limit: data.average.gas_limit,
                    total: data.average.total,
            },
            fast: {
                gas_price: data.fast.gas_price,
                    gas_limit: data.fast.gas_limit,
                    total: data.fast.total,
            }
        };

        UICtrl.displayNetworkFee({
           slow: data.slow.total,
           average: data.average.total,
           fast: data.fast.total
        });

        UICtrl.displayAdvancedView({
            gas_price: transaction.selected_fee.slow.gas_price,
            gas_limit: transaction.selected_fee.slow.gas_limit,
        });
        uiCalculation( {
            gas_price: transaction.selected_fee.slow.gas_price,
            gas_limit: transaction.selected_fee.slow.gas_limit
        });
    });

    var checkNetworkFee = function(value) {
        let data = AccountSession.getModel();
        estimateNetworkFee({
            from_address: data.wallet_address,
            to_address: value
        });
    };


    var CONSendTransaction = function() {
        let data = AccountSession.getModel();
        var object = UICtrl.getInput();
        console.log('click', object);

        switch (transaction.type) {
            case 'slow' :
                Con_sendTransaction({
                    from_address: data.wallet_address,
                    private_key: data.private_key,
                    to_address: object.to_address,
                    value: object.transfer_amount,
                    gasLimit: transaction.selected_fee.slow.gas_limit,
                    gasPrice: transaction.selected_fee.slow.gas_price,
                    type: 'slow'
                });
                break;

            case 'average' :
                Con_sendTransaction({
                    from_address: data.wallet_address,
                    private_key: data.private_key,
                    to_address: object.to_address,
                    value: object.transfer_amount,
                    gasLimit: transaction.selected_fee.average.gas_limit,
                    gasPrice: transaction.selected_fee.average.gas_price,
                    type: 'average'
                });
                break;

            case 'fast' :
                Con_sendTransaction({
                    from_address: data.wallet_address,
                    private_key: data.private_key,
                    to_address: object.to_address,
                    value: object.transfer_amount,
                    gasLimit: transaction.selected_fee.fast.gas_limit,
                    gasPrice: transaction.selected_fee.fast.gas_price,
                    type: 'fast'
                });
                break;

            case 'advanced' :
                Con_sendTransaction({
                    from_address: data.wallet_address,
                    private_key: data.private_key,
                    to_address: object.to_address,
                    value: object.transfer_amount,
                    gasLimit: object.gas_limit,
                    gasPrice: object.gas_price,
                    type: 'advanced'
                });
                break;

            default:
                Con_sendTransaction({
                    from_address: data.wallet_address,
                    private_key: data.private_key,
                    to_address: object.to_address,
                    value: object.transfer_amount,
                    gasLimit: object.gas_limit,
                    gasPrice: object.gas_price,
                    type: 'default'
                });
                break
        }
    };

    var ETHSendTransaction = function() {
        let data = AccountSession.getModel();
        var object = UICtrl.getInput();
        console.log('click', object);

        switch (transaction.type) {
            case 'slow' :
                Eth_sendTransaction({
                    from_address: data.wallet_address,
                    private_key: data.private_key,
                    to_address: object.to_address,
                    value: object.transfer_amount,
                    gasLimit: transaction.selected_fee.slow.gas_limit,
                    gasPrice: transaction.selected_fee.slow.gas_price,
                    type: 'slow'
                });
                break;

            case 'average' :
                Eth_sendTransaction({
                    from_address: data.wallet_address,
                    private_key: data.private_key,
                    to_address: object.to_address,
                    value: object.transfer_amount,
                    gasLimit: transaction.selected_fee.average.gas_limit,
                    gasPrice: transaction.selected_fee.average.gas_price,
                    type: 'average'
                });
                break;

            case 'fast' :
                Eth_sendTransaction({
                    from_address: data.wallet_address,
                    private_key: data.private_key,
                    to_address: object.to_address,
                    value: object.transfer_amount,
                    gasLimit: transaction.selected_fee.fast.gas_limit,
                    gasPrice: transaction.selected_fee.fast.gas_price,
                    type: 'fast'
                });
                break;

            case 'advanced' :
                Eth_sendTransaction({
                    from_address: data.wallet_address,
                    private_key: data.private_key,
                    to_address: object.to_address,
                    value: object.transfer_amount,
                    gasLimit: object.gas_limit,
                    gasPrice: object.gas_price,
                    type: 'advanced'
                });
                break;

            default:
                Eth_sendTransaction({
                    from_address: data.wallet_address,
                    private_key: data.private_key,
                    to_address: object.to_address,
                    value: object.transfer_amount,
                    gasLimit: object.gas_limit,
                    gasPrice: object.gas_price,
                    type: 'default'
                });
                break
        }

    };

    return {
        init: function () {
            console.log('Home Application has started !');
            setupEventListeners();
            checkBalance();
            transaction.coin_type = $("#to_type").val();
            UICtrl.displayAll();
            store.subscribe(UICtrl.displayAll);
        }
    };
})(transUIController);

mainController.init();
