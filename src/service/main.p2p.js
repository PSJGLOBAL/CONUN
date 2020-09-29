const { dialog } = require('electron')
const log = require('electron-log');
const p2pProcess = require('conun-p2p/p2p.processor');
const p2pManager = require('conun-p2p/p2p.manager');
const DbHelper = require('../../src/js/models/helper/module.sequelizer');
const { eventHunter, dispatchEvent } = require('conun-ipc/middleware/main.event.hunter');
const { p2ptoMainChannel } = require('./main.hub')

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- P2P MANAGER START -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

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
    if(p2pManager.appMode !== 'REQUESTER') {

        const options = {
            type: 'question',
            buttons: ['OK'],
            defaultId: 2,
            title: `CONUN MANAGER MODE`,
            message: `Sorry we could not upload project because, current mode is not Requester`,
            detail: `Please open manager setting and change to requester mode`
        };

        dialog.showMessageBox(null, options, () => {});
    } else {
        DbHelper.checkNodeId(1)
            .then(resp => {
                response.requester_uid = resp.dataValues.wallet_address;
                DbHelper.requesterProjectCreate(response)
                    .then(() => {
                        log.info('P2P upload  ufter db save', response);
                        p2pManager.publishProjectContent(response);
                    }).catch(() => {
                    dialog.showErrorBox('Error During Upload', 'This project has already been created before, please check it before uploading.')
                })
            })
    }
})

//tag: provider
dispatchEvent.listener.on('PROVIDER_SELECTED_CONTENT',function (response) {
    log.info('PROVIDER_SELECTED_CONTENT');
    log.info(response);
    DbHelper.updateProjectByElement(response)
        .then(() => {
            response.project.os = process.platform;
            p2pManager.selectProjectContent(response.project);
    })
})

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-         P2P MANAGER END        -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
module.exports = {
    init: () => {
        p2pManager.init();
        dispatchEvent.init('P2P_CHANNEL_REQ')
        DbHelper.getSettingsByID(1)
            .then(setting => {
                p2pManager.appMode = JSON.parse(setting.dataValues.user_mode);
                console.log('Setting Mode: ', p2pManager.appMode )
            }).catch(err => {
                throw err
        })
    }
}
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=