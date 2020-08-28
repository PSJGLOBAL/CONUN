const electron = require('electron');
const { remote } = electron;
const { eventHunter, EventSubscriber, eventListener, dispatchEvent } = require('conun-ipc/middleware/renderer.event.hunter');
const {ApplicationStorage} = require('../ui.objects')
const { appLocation } = require('./ui.main');
const Store = require('electron-store');
const mainStore = new Store();
var settingUIController = (function () {
    var DOMStrings = {
        setLanguage: 'txt_current_language',
        setNetworkStatus: 'txt_network_status',
        setTxtNodeCount: 'txt_node_count',
        txtReqPath: 'req_path',
        txtProvPath: 'prov_path',
        btnLogout: 'account_logout',
        btnChangeReqPath: 'change_req_path',
        btnChangeProvPath: 'change_prov_path',

        btnApplyChanges: 'apply_set_change',

        btnReqMode: 'switch_req_mod',
        btnProMode: 'switch_pro_mod'
    };

    return {
        displayNetwork: function() {
            document.getElementById(DOMStrings.setNetworkStatus).innerHTML = appListener().getApp('network_status');
            document.getElementById(DOMStrings.setTxtNodeCount).innerHTML = appListener().getApp('online_nodes');
        },
        displaySettings: function(value) {
            console.log('displaySettings: ', value);
            if(value.current_language)document.getElementById(DOMStrings.setLanguage).innerHTML = value.current_language;
            if(value.requester_path)document.getElementById(DOMStrings.txtReqPath).value = value.requester_path;
            if(value.provider_path)document.getElementById(DOMStrings.txtProvPath).value = value.provider_path;
            if(value.requester_mode)document.getElementById(DOMStrings.btnReqMode).checked = value.requester_mode;
            if(value.provider_mode)document.getElementById(DOMStrings.btnProMode).checked = value.provider_mode;
        },
        getDOMstrings: function () {
            return DOMStrings;
        }
    }

})();


var setSettingController = (function (UiSetting) {
    var DOM = UiSetting.getDOMstrings();
    const ui_settings = {
        current_language: 'English',
        resource_control: {
            cpu: '75',
            ram: '35',
            hard: '25'
        },
        user_mode: {
            provider_mode: null,
            requester_mode: null
        },
        path: {
            requester_path: 'c://',
            provider_path: 'd://'
        },
        is_active: true
    };

    var setupEventListeners = function () {

        document.getElementById(DOM.btnLogout).addEventListener('click', accountLogout);

        document.getElementById(DOM.btnApplyChanges).addEventListener('click', function () {
            console.log('clicked', ui_settings);
            eventHunter.APPLICATION_CHANNEL_REQ = {
                event: 'APPLY_SETTINGS',
                value: ui_settings
            }
        });
        // TODO change req path to download
        document.getElementById(DOM.btnChangeReqPath).addEventListener('click', function () {
            //ipcRenderer.send('show-open-dialog', {type: 'requester_folder'});
        });
        // TODO change pro path to download
        document.getElementById(DOM.btnChangeProvPath).addEventListener('click', function () {
            //ipcRenderer.send('show-open-dialog', {type: 'provider_folder'});
        });

        document.getElementById(DOM.btnReqMode).addEventListener('click', function () {
            var req_check = document.getElementById(DOM.btnReqMode).checked;
            var pro_check = document.getElementById(DOM.btnProMode).checked;
            if(req_check === true && pro_check === true) {
                document.getElementById(DOM.btnReqMode).checked = true;
                document.getElementById(DOM.btnProMode).checked = false;
            }
            SelectOperatorMode()
        })

        document.getElementById(DOM.btnProMode).addEventListener('click', function () {
            var req_check = document.getElementById(DOM.btnReqMode).checked;
            var pro_check = document.getElementById(DOM.btnProMode).checked;
            if(pro_check === true && req_check === true) {
                document.getElementById(DOM.btnReqMode).checked = false;
                document.getElementById(DOM.btnProMode).checked = true;
            }
            SelectOperatorMode()
        })
    };

    function SelectOperatorMode() {
        $('button#apply_set_change').removeAttr('disabled');
        var req_check = document.getElementById(DOM.btnReqMode).checked;
        var pro_check = document.getElementById(DOM.btnProMode).checked;
        if(req_check === true) {
            ui_settings.user_mode.requester_mode = req_check;
            ui_settings.user_mode.provider_mode = pro_check;
            console.log('req_check')
        }
        else if(pro_check === true) {
            ui_settings.user_mode.requester_mode = req_check;
            ui_settings.user_mode.provider_mode = pro_check;
            console.log('pro_check')
        }
        else if(req_check === false && pro_check === false) {
            ui_settings.user_mode.requester_mode = req_check;
            ui_settings.user_mode.provider_mode = pro_check;
            console.log('disabled')
        }
    }

    dispatchEvent.listener.on('UPDATE_SETTINGS', async function (response) {
        console.log('connection:', response)
        $('button#apply_set_change').prop("disabled", true);
        let path = JSON.parse(response.path)
        let user_mode = JSON.parse(response.user_mode)
        ApplicationStorage.setModel('APP_SETTINGS', JSON.stringify({
            current_language: response.current_language,
            requester_path: path.requester_path,
            provider_path: path.provider_path,
            requester_mode: user_mode.requester_mode,
            provider_mode: user_mode.provider_mode
        }))

        UiSetting.displaySettings({
            current_language: response.current_language,
            requester_path: path.requester_path,
            provider_path: path.provider_path,
            requester_mode: user_mode.requester_mode,
            provider_mode: user_mode.provider_mode
        });
    });

    function accountLogout () {
        console.log('Log out');
        mainStore.clear();
        const window = remote.getCurrentWindow();
        window.close();
    }

    return {
        init: function () {
            console.log('Setting Application Started');
            dispatchEvent.init('APPLICATION_CHANNEL_RES');
            setupEventListeners();
            let res = JSON.parse(ApplicationStorage.getModel('APP_SETTINGS'))
            console.log('res', res)
            UiSetting.displaySettings(res)
            //UiSetting.displayNetwork();
        }
    }

})(settingUIController);

setSettingController.init();