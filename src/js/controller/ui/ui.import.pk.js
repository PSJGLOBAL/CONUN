const { eventHunter, EventSubscriber, dispatchEvent } = require('conun-ipc/middleware/renderer.event.hunter');

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
        let getKey = UIGet().getInput();
        getKey = getKey.privateKey;
        console.log('getKey: ', getKey)
        if(getKey.length)
            eventHunter.WEB3_CHANNEL_REQ = {
                event: 'GET_WALLET_WITH_PK',
                value: {
                    CMD: 'IMPORT_PRIVATE_KEY_REQ',
                    data: {privateKey: getKey}
                }
            }
    }
    dispatchEvent.listener.on('IMPORT_PRIVATE_KEY_RES', function(response) {
        if(response.wallet_address)
            window.location.href = '../../../view/page/home.html';
    });

    return {
        init: function () {
            console.log('Application Started. ');
            setupEventListeners();
            dispatchEvent.init('WEB3_CHANNEL_RES')
        }
    };
})();

ImportPrivateKey.init();
