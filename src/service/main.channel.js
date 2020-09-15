const electron = require('electron');
const ipcMain = electron.ipcMain;
const { app } = electron;
const { dialog } = require('electron')
const p2pManager = require('conun-p2p/p2p.manager');
const DbHelper = require('../../src/js/models/helper/module.sequelizer');
const web3Handlers = require('../js/web3/async.process.web3');
const { QrCodeChildWindow,  PopUpChildWindow } = require('./main.app');
const { ipcDispatcher, subscriber } = require('conun-ipc/middleware/ipcMain.poster');
const { eventHunter, EventSubscriber, dispatchEvent } = require('conun-ipc/middleware/main.event.hunter');
const events = require('events');
const emitter = new events.EventEmitter();
const log = require('electron-log');
const { p2ptoMainChannel, mainToMainChannel } = require('./main.hub')


//  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- GET FROM P2P TO MAIN START -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// p2p provider save project list db

//tag: provider
p2ptoMainChannel.on('REQUESTER_PROJECT_CONTENT',  function (response) {
    log.info('SAVE TO DB LIST: ', response);
    DbHelper.checkNodeId(1)
        .then( db_resp => {
            response.provider_uid = db_resp.dataValues.wallet_address;
            DbHelper.providerProjectListCreate({
                project_status: response.project_status,
                project_sequence: response.project_sequence,
                project_name: response.project_name,
                project_id: response.project_id,
                project_description: response.project_description,
                requester_uid:  response.requester_uid,
                resource_type:  response.resource_type,
                pay_type: response.pay_type,
                credit:  response.credit,
                start_date: response.start_date,
                end_date: response.end_date,
                total_tasks: response.total_tasks,
                completed_tasks: response.completed_tasks,
                task_created_date: response.task_created_date
            })
        })
        .then(()=> {
            console.log('CALLBACK_UPDATE_PROVIDER_UI')
            eventHunter.APPLICATION_CHANNEL_RES = {
                event: 'CALLBACK_UPDATE_PROVIDER_UI',
                value: null,
            }
        })
})

//tag: requester
p2ptoMainChannel.on('PROVIDER_SELECTED_CONTENT', function (response) {
    log.info('PROVIDER_SELECTED_CONTENT: ', response);
})
//  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- GET FROM P2P TO MAIN END -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=


//  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- APPLICATION START -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// TODO select project content p2pManager.takingProjectContent(response);
//tag: default
dispatchEvent.listener.on('APPLY_SETTINGS', async function (result) {
    let setting = await DbHelper.getSettingsByID(1);
    if(setting === null) {
        const db_status = await DbHelper.createSettings({
            current_language: result.current_language,
            resource_control: JSON.stringify(result.resource_control),
            user_mode: JSON.stringify(result.user_mode),
            path: JSON.stringify(result.path),
            is_active: result.is_active
        })
        console.log('db_status: ', db_status);
        if(db_status) {
            let setting = await DbHelper.getSettingsByID(1);
            eventHunter.APPLICATION_CHANNEL_RES = {
                event: 'UPDATE_SETTINGS',
                value:  setting.dataValues,
            }
        }
    } else {
        const db_status = await DbHelper.updateSettingsByElement({
            id: 1,
            current_language: result.current_language,
            resource_control: JSON.stringify(result.resource_control),
            user_mode: JSON.stringify(result.user_mode),
            path: JSON.stringify(result.path),
            is_active: result.is_active
        })
        console.log('db_status: ', db_status);
        if(db_status) {
            let setting = await DbHelper.getSettingsByID(1);
            eventHunter.APPLICATION_CHANNEL_RES = {
                event: 'UPDATE_SETTINGS',
                value:  setting.dataValues,
            }
        }
    }
    log.info('DB SAVED APP MODE: ', JSON.stringify(result.user_mode));
    p2pManager.appMode = JSON.stringify(result.user_mode);
})
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- APPLICATION END -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=


//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- WEB3 Listener START -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
web3Handlers.web3Event.on('res-web3-event',async function (result) {
    log.info('WEB3 Listener: ', result);
    if(result.CMD === 'RES_CREATE_ACCOUNT') {
        let db_status = await DbHelper.accountCreate({
            wallet_address: result.data['wallet_address'],
            wallet_private_key: result.data['privateKey'],
            password: result.data['password']
        })
        log.info('db_status:',db_status)
        if(db_status === true)
            ipcDispatcher.RES_CREATE_WALLET = result;
    }

    if(result.CMD === 'RES_CHECK_BALANCE_OF') {
            eventHunter.WEB3_CHANNEL_RES = {
                event: 'SET_WALLET_BALANCE',
                value: {coin_con: result.data.coin_con, coin_eth: result.data.coin_eth},
            }
    }

    if(result.CMD === 'IMPORT_JSON_KEYSTORE_RES') {
        console.log('IMPORT_JSON_KEYSTORE_RES: ', result);
        if(result.data['wallet_address']) {
            let db_status = await DbHelper.accountCreate({
                wallet_address: result.data['wallet_address'],
                wallet_private_key: result.data['privateKey'],
                password: result.data['password']
            })
            if(db_status === true)
                eventHunter.WEB3_CHANNEL_RES = {
                    event: 'IMPORT_JSON_KEYSTORE_RES',
                    value: result.data,
                }
        } else {
            eventHunter.WEB3_CHANNEL_RES = {
                event: 'IMPORT_JSON_KEYSTORE_RES',
                value: result.data,
            }
            dialog.showErrorBox('Oops! Something went wrong!', String(result.data.error))
        }
    }

    if(result.CMD === 'IMPORT_PRIVATE_KEY_RES') {
        console.log('IMPORT_PRIVATE_KEY_RES: ', result);
        if(result.data['wallet_address']) {
            let db_status = await DbHelper.accountCreate({
                wallet_address: result.data['wallet_address'],
                wallet_private_key: result.data['privateKey'],
                password: result.data['password']
            })
            if(db_status === true)
                eventHunter.WEB3_CHANNEL_RES = {
                    event: 'IMPORT_PRIVATE_KEY_RES',
                    value: result.data,
                }
        } else {
            eventHunter.WEB3_CHANNEL_RES = {
                event: 'IMPORT_PRIVATE_KEY_RES',
                value: result.data,
            }
            dialog.showErrorBox('Oops! Something went wrong!', String(result.data.error))
        }

    }
});

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-       Listener     -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-       Poster       -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
emitter.on('CREATE_WALLET', function (response) {
    console.log('First subscriber: ', response);
    web3Handlers.web3Service(response.CMD, response.data);
});

dispatchEvent.listener.on('GET_WALLET_BALANCE', function(response) {
    console.log('GET_WALLET_BALANCE: ', response)
    web3Handlers.web3Service(response.CMD, response.wallet_address);
});

dispatchEvent.listener.on('GET_WALLET_WITH_JSON_KEYSTORE', function(response) {
    console.log('GET_WALLET_WITH_JSON_KEYSTORE: ', response)
    web3Handlers.web3Service(response.CMD, response.data);
});

dispatchEvent.listener.on('GET_WALLET_WITH_PK', function(response) {
    console.log('GET_WALLET_WITH_PK: ', response)
    web3Handlers.web3Service(response.CMD, response.data);
});
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- WEB3 END -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=




//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- DATABASE START -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
dispatchEvent.listener.on('GET_ACCOUNT_ADDR', async function (value) {
    // console.log('GET_ACCOUNT_ADDR: ', value);
    const db_resp = await DbHelper.checkNodeId(value.id);
    // console.log('resp_node: ', db_resp);
    eventHunter.DATABASE_CHANNEL_RES = {
        event: 'SET_ACCOUNT_ADDR',
        value:  db_resp.dataValues,
    }
});

dispatchEvent.listener.on('GET_ALL_PROJECT_LIST',function () {
    DbHelper.findAllProviderProjectList()
        .then(db_resp => {
            // console.log('GET_ALL_PROJECT_LIST: ', db_resp);
            eventHunter.DATABASE_CHANNEL_RES = {
                event: 'SET_ALL_PROJECT_LIST',
                value:  db_resp,
            }
        })
});



mainToMainChannel.on('QUIT_EVENT', function () {
    DbHelper.providerProjectListDelete()
})

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- DATABASE END -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=






// TODO emitter Change to dispatchEvent
emitter.on('QR_CODE_WINDOW', function (response) {
    console.log('First subscriber: ', response);
    QrCodeChildWindow();
});


emitter.on('OPEN_POPUP_WINDOW', async function (response) {
    console.log('First subscriber: ', response);
    await subscriber(response, PopUpChildWindow);
});

emitter.on('OPEN_MAIN_WINDOW',  function (response) {
    console.log('OPEN_MAIN_WINDOW: ', response);
    ipcDispatcher.OPEN_MAIN_WINDOW = response;
});






//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- IPC MAIN START -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

//todo change it
ipcMain.on('DISPATCHER-MESSAGE', (event, args) => {
    console.log('DISPATCHER-MESSAGE: ', args);
    emitter.emit(args.event, args.value);
});

dispatchEvent.init('DATABASE_CHANNEL_REQ')
dispatchEvent.init('WEB3_CHANNEL_REQ')
dispatchEvent.init('APPLICATION_CHANNEL_REQ')

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- IPC MAIN END -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=