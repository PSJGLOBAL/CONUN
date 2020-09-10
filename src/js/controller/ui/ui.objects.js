const ApplicationStorage = {
    getModel: function(key) {
        console.log('AppStorage getModel: ', key, localStorage.getItem(key));
        return localStorage.getItem(key);
    },
    setModel: function(key, value) {
        console.log('AppStorage setModel: ', key, value);
        localStorage.setItem(key, value);
    },
    clearMode: function (val) {
        if(val === 'all'){ localStorage.clear(); }
        else { localStorage.removeItem(val); }
    }
};

const ApplicationSession = {
    getModel: function(key) {
        console.log('AppSession getModel: ', key, sessionStorage.getItem(key));
        return sessionStorage.getItem(key);
    },

    setModel: function(key, value) {
        console.log('AppSession setModel: ', key, value);
        sessionStorage.setItem(key, value);
    }
};



module.exports = {
    ApplicationSession,
    ApplicationStorage,
};