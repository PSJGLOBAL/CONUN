const log = require('electron-log');
const p2pProcess = require('conun-p2p/p2p.processor');
const p2pManager = require('conun-p2p/p2p.manager');
const DbHelper = require('../../src/js/models/helper/module.sequelizer');
const { eventHunter, dispatchEvent } = require('conun-ipc/middleware/main.event.hunter');
const { p2ptoMainChannel } = require('./main.hub')

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- P2P MANAGER START -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// p2p => front
// p2p => main

p2pProcess.p2pProcess.on('message', (res) => {
    log.info('EVENT P2P_CHANNEL_RES >> :', res);
    // Send event for other main processors
    p2ptoMainChannel.emit(res.event, res.data);
    // Send event for front controller processors
    eventHunter.P2P_CHANNEL_RES = {
        event: res.event,
        value: res.data,
    }
})

//tag:  requester
dispatchEvent.listener.on('P2P-UPLOAD-PROJECT',function (response) {
    log.info('P2P-UPLOAD-PROJECT: ', response);
    DbHelper.checkNodeId(1)
        .then(resp => {
            response.requester_uid = resp.dataValues.wallet_address;
            log.info('db_resp: ', response.requester_uid);

            DbHelper.requesterProjectCreate(response)
                .then( resp => {
                    console.log('DATA BASE SAVED: ', resp);
                    p2pManager.publishProjectContent(response);
        })
    })
})

//tag: provider
dispatchEvent.listener.on('PROVIDER_SELECTED_CONTENT',function (response) {
    log.info('PROVIDER_SELECTED_CONTENT');
    log.info(response);
    DbHelper.updateProjectByElement(response)
        .then(() => {
            p2pManager.selectProjectContent(response.project);
    })
})

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-         P2P MANAGER END        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
module.exports = {
    init: async () => {
        p2pManager.init();
        dispatchEvent.init('P2P_CHANNEL_REQ')
        // TODO Check Manager app if new user (ERROR Here)
        // After changing user mode, application cant updated user mode status
        let setting =  await DbHelper.getSettingsByID(1);
        if(setting) {
            p2pManager.appMode = JSON.parse(setting.dataValues.user_mode);
            console.log('Setting Mode: ', p2pManager.appMode )
        }
    }
}
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=