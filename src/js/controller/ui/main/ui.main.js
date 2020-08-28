const { dispatchEvent } = require('conun-ipc/middleware/renderer.event.hunter');
const { Subscriber } = require('conun-ipc/middleware/process.subscriber');
const {ApplicationStorage, ApplicationSession} = require('../ui.objects');

//check current position of application, check corrent view

var appLocation = {
    checkDefine: function(key, value) {
        console.log('appLocation -> checkDefine: ', key, value);
        let defined = ApplicationSession.getModel(key);
        return defined === value.toString()

    },

    getDefine: function() {
        console.log('appLocation -> getDefine: ', 'appLocation');
        return ApplicationSession.getModel('appLocation');
    },

    setDefine: function(key, val) {
        console.log('appLocation -> setDefine: ', key, val);
        ApplicationSession.setModel(key, val);
    }
};


var appContent = {
    getDefine: function(key) {
        console.log('appContent -> getDefine: ',key);
        return ApplicationSession.getModel(key);
    },

    setDefine: function(key, val) {
        console.log('appContent -> setDefine: ', key, val);
        ApplicationSession.setModel(key, val);
    }
};

dispatchEvent.listener.on('P2P-CONNECTION_RES',function (response) {
    console.log('connection:', response);
    //await EventSubscriber(await response, UICtrl.displayWallet );
    appContent.setDefine('P2P-CONNECTION_RES', JSON.stringify(response))
    net_connection.execute(response);
    if(response.connection === 'Connection Failed') {
        console.log('Notification Failed');
        new Notification ( 'CONUN Manager', {
            body: 'Network Error: Connection Failed!'
        });
    }
});



const net_connection = new Subscriber('CONNECTION_RES');
dispatchEvent.init('P2P_CHANNEL_RES');


module.exports = {
    appLocation,
    appContent,
    net_connection,
}