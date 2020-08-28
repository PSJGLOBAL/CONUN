const { ipcDispatcher } = require('conun-ipc/middleware/ipcRenderer.poster');

var AccountUIController = (function () {

    var DOMStrings = {
        inTextPassword: '.int_wallet_password',
        btnCreateWallet: '.btn_create_wallet',
    };

    return {
        getInput: function() {
            return {
                wallet_password: document.querySelector(DOMStrings.inTextPassword).value,
            };
        },

        getDOMstrings: function () {
            return DOMStrings;
        }
    };

})();


function keyPressListener(callback) {
    document.addEventListener('keypress', function(event) {
        if (event.keyCode === 13 || event.which === 13) {
            callback();
        }
    });
}

var controller = (function (UICtrl) {
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.btnCreateWallet).addEventListener('click', makeWallet);
        keyPressListener(makeWallet);
    };

    var makeWallet = async function () {
        var input_psw = UICtrl.getInput();
        console.log('input_psw: ', input_psw)
        if(input_psw.wallet_password) {
            console.log('input_psw >>  >>: ', input_psw)
            ipcDispatcher.CREATE_WALLET = { CMD: 'CREATE_ACCOUNT', data: input_psw.wallet_password }
            let response = await ipcDispatcher.RES_CREATE_WALLET;
            console.log('response: ', response);
            if (response.CMD === 'RES_CREATE_ACCOUNT') {
                // windowDispatcher.WALLET_BACK_UP = JSON.stringify({
                //     wallet_address: response.data['wallet_address'],
                //     wallet_private_key: response.data['privateKey'],
                //     password: response.data['password']
                // })
                console.log('next page move >>');
                window.location.href = '../../../view/page/access/wallet03.html';
            }
        }
    };


    return {
        init: function() {
            console.log('ui.account.create');
            setupEventListeners();
        }
    };

})(AccountUIController);

controller.init();
