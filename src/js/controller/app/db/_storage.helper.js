const moment = require('moment');
const AppStorage = {
    getModel: function(key) {
        // console.log('AppStorage getModel: ', key, localStorage.getItem(key));
        return localStorage.getItem(key);
    },
    setModel: function(key, value) {
        // console.log('AppStorage setModel: ', key, value);
        localStorage.setItem(key, value);
    }
};


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- Requester -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
let requested_app = {
  index: 0,
  tasks: []
};

const AppRequester = {
    addProject: function(value) {
         // console.log('REQUESTER value: ', value);
         if(AppStorage.getModel('REQUESTER_APP') === null) {
             // console.log('... new add');
             if(value.project_id) requested_app.project_id = value.project_id;
             if(value.project_name) requested_app.project_name = value.project_name;
             if(value.start_date) requested_app.start_date = value.start_date;
             if(value.end_date) requested_app.end_date = value.end_date;
             let request_map = new Map();
             let data_map = request_map.set(value.project_id, requested_app);
             // console.log('REQUESTER_APP data: ', JSON.stringify(Array.from(data_map)));
             AppStorage.setModel('REQUESTER_APP', JSON.stringify(Array.from(data_map)));
         }
         else {
             // console.log('... existing add');
             let get_map = new Map(JSON.parse(AppStorage.getModel('REQUESTER_APP')));
             if(value.project_id) requested_app.project_id = value.project_id;
             if(value.project_name) requested_app.project_name = value.project_name;
             if(value.start_date) requested_app.start_date = value.start_date;
             if(value.end_date) requested_app.end_date = value.end_date;

             requested_app.index = get_map.size;
             let add_map = get_map.set(value.project_id, requested_app);
             // console.log('Get REQUESTER App data: ', JSON.stringify(Array.from(add_map)));
             AppStorage.setModel('REQUESTER_APP', JSON.stringify(Array.from(add_map)));
         }
    },

    getProject: function() {
        return  new Map(JSON.parse(AppStorage.getModel('REQUESTER_APP')));
    },

    checkProjectMem: function() {
        return AppStorage.getModel('REQUESTER_APP');
    },

    updateProject: function(key, value) {
        console.log('updateProject: ', key, value);
        let get_map = new Map(JSON.parse(AppStorage.getModel('REQUESTER_APP')));
        let search_index = get_map.get(key);
        console.log('search_index: ', search_index);
        requested_app.index = search_index.index;
        requested_app.project_id = search_index.project_id;
        requested_app.project_name = search_index.project_name;
        requested_app.start_date = search_index.start_date;
        requested_app.end_date = search_index.end_date;
        requested_app.tasks = search_index.tasks;
        console.log('requested task size: ', requested_app.tasks.length);
        let now  = moment().format('YYYY-MM-DD HH:m:s');
        let past = requested_app.start_date;
        let work_time = moment.utc(moment(now,"YYYY-MM-DD HH:m:s").diff(moment(past,"YYYY-MM-DD HH:m:s"))).format("HH:mm:ss")
        console.log('Work Time: ', work_time);
        let object = {
                index: requested_app.tasks.length,
                task_id: value.task_id,
                result_hash: value.result_hash,
                work_time: work_time,
                wallet_address: '',
                status: value.status
            };
            requested_app.tasks.push(object);


        console.log('requested_app: ', requested_app);
        let add_map = get_map.set(key, requested_app);
        AppStorage.setModel('REQUESTER_APP', JSON.stringify(Array.from(add_map)));
    },
};


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- Provider -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

const provider_app = {
    index: 0
};


const AppProvider = {
    addTask: function (value) {
        // console.log('PROVIDER value: ', value);
        if(AppStorage.getModel('PROVIDER_APP') === null) {
            // console.log('... new task add', value);
            if(value.project_name) provider_app.project_name = value.project_name;
            if(value.task_id) provider_app.task_id = value.task_id;
            if(value.file_hash) provider_app.file_hash = value.file_hash;
            if(value.date) provider_app.date = value.date;
            if(value.status) provider_app.status = value.status;

            let provider_map = new Map();
            let data_map = provider_map.set(value.task_id, provider_app);
            console.log('set PROVIDER_APP: ', JSON.stringify(Array.from(data_map)));
            AppStorage.setModel('PROVIDER_APP', JSON.stringify(Array.from(data_map)));

        } else {
            // console.log('... existing task add');
            let get_map = new Map(JSON.parse(AppStorage.getModel('PROVIDER_APP')));
            if(value.project_name) provider_app.project_name = value.project_name;
            if(value.task_id) provider_app.task_id = value.task_id;
            if(value.file_hash) provider_app.file_hash = value.file_hash;
            if(value.date) provider_app.date = value.date;
            if(value.status) provider_app.status = value.status;

            provider_app.index = get_map.size;
            let add_map = get_map.set(value.task_id, provider_app);
            console.log('Get PROVIDER_APP: ', add_map);
            AppStorage.setModel('PROVIDER_APP', JSON.stringify(Array.from(add_map)));
        }
    },

    updateTask: function(key, value) {
        let get_map = new Map(JSON.parse(AppStorage.getModel('PROVIDER_APP')));
        let search_index = get_map.get(key);
        console.log('search_index: ', search_index);
        provider_app.index = search_index.index;
        provider_app.project_name = search_index.project_name;
        provider_app.task_id = search_index.task_id;
        provider_app.file_hash = search_index.file_hash;
        provider_app.date = search_index.date;

        provider_app.result_hash = value.result_hash;
        provider_app.status = value.status;
        provider_app.tx_hash = value.tx_hash;

        let add_map = get_map.set(key, provider_app);
        AppStorage.setModel('PROVIDER_APP', JSON.stringify(Array.from(add_map)));
    },


    getTask: function() {
        return  new Map(JSON.parse(AppStorage.getModel('PROVIDER_APP')));
    },

    checkTaskMem: function() {
        return AppStorage.getModel('PROVIDER_APP');
    }
};

module.exports = {
    AppStorage,
    AppRequester,
    AppProvider
};
