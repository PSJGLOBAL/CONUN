const { eventHunter, EventSubscriber, eventListener, dispathEvent } = require('conun-ipc/middleware/renderer.event.hunter');
const { Subscriber } = require('conun-ipc/middleware/process.subscriber');
const {ApplicationStorage} = require('../../ui/ui.objects')
const { appLocation, appContent, net_connection } = require('./ui.main');
const Store = require('electron-store');
const mainStore = new Store();

var homeUIController = (function () {

    var DOMStrings = {
        setNetworkStatus: 'txt_network_status',
        setTxtNodeCount: 'txt_node_count',
        seTextAccountAddr:'account_addr',
        setTextConunBalance: 'txt_conun_balance',
        setTextEtherBalance: 'txt_ether_balance',

        setRequestedProjects: 'txt_requested_projects',
        setReqUnderProcess: 'txt_req_under_process',
        setProCompletedTasks: 'txt_pro_completed_tasks',
        setProUnderProcess: 'txt_pro_under_process',
        btnUpdate: 'update_btn'
    };

    return {
        displayWallet: function(object) {
            console.log('Home display >>', object);
            if(object.connection) document.getElementById(DOMStrings.setNetworkStatus).innerHTML = object.connection;
            // document.getElementById(DOMStrings.setTxtNodeCount).innerHTML = 'online_nodes';
            if(object.wallet_address)document.getElementById(DOMStrings.seTextAccountAddr).value = object.wallet_address;
            if(object.coin_con)document.getElementById(DOMStrings.setTextConunBalance).innerHTML = object.coin_con;
            if(object.coin_eth)document.getElementById(DOMStrings.setTextEtherBalance).innerText = object.coin_eth;
        },

        displayProcessCount: function(object) {
            console.log('ProcessCount display >>', object);
            if(object.projects)document.getElementById(DOMStrings.setRequestedProjects).innerHTML = object.projects;
            if(object.tasks)document.getElementById(DOMStrings.setProCompletedTasks).innerHTML = object.tasks;
        },

        getDOMstrings: function () {
            return DOMStrings;
        }
    }

})();


var serviceController = (function () {
    return {
        accountService: async function () {
            eventHunter.DATABASE_CHANNEL_REQ = {
                event: 'GET_ACCOUNT_ADDR',
                value: {
                    id: 1
                }
            }
            return eventHunter.DATABASE_CHANNEL_RES;
        },

        walletBalanceService: function (wallet_address)  {
            console.log('walletBalanceService: ', wallet_address)
            eventHunter.WEB3_CHANNEL_REQ = {
                event: 'GET_WALLET_BALANCE',
                value: {
                    CMD: 'CHECK_BALANCE_OF',
                    wallet_address: wallet_address
                }
            }
            return eventHunter.WEB3_CHANNEL_RES;
        },

        processService: function () {

        },

        connectionService: function () {

        }
    }
})();


var setController = (function (UICtrl, Serving) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.getElementById(DOM.btnUpdate).addEventListener('click',async function () {
            let account = await Serving.accountService();
            let balance = await Serving.walletBalanceService(account.value.wallet_address);
            await EventSubscriber( account.value, UICtrl.displayWallet);
            await EventSubscriber( balance.value, UICtrl.displayWallet);
            ApplicationStorage.setModel('APP_WALLET_ADDR', JSON.stringify({wallet_address: account.value.wallet_address}));
        });
    };

    //update (subscribe to event updates)
    net_connection.on('CONNECTION_RES', UICtrl.displayWallet);

    return {
        //set (first view set)
        init: async function () {
            console.log('Home Application has started !');
            UICtrl.displayWallet(JSON.parse(appContent.getDefine('P2P-CONNECTION_RES')))
            let account = JSON.parse(ApplicationStorage.getModel('APP_WALLET_ADDR'))
            let balance = await Serving.walletBalanceService(account.wallet_address);
            await EventSubscriber( account, UICtrl.displayWallet);
            await EventSubscriber( balance.value, UICtrl.displayWallet);

            // TODO change to DB Mode
            if(!appLocation.checkDefine('GetStarted', true)) {
                mainStore.set('window_state', 'main');
                appLocation.setDefine('GetStarted', true);
            }

            UICtrl.displayProcessCount('object');
            setupEventListeners();

        }
    };
})(homeUIController, serviceController);

setController.init();
