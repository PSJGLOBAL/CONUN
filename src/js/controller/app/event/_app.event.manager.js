const mapper = new Map();

function networkReduce(state, action) {
    if (typeof state === 'undefined' || typeof action.payload === 'undefined') {
        return 0;
    }
    let data;
    state = {
        getEvent: function(key) {
            // console.log('getEvent: ');
            // console.log(mapper.get(key));
            return mapper.get(key);
        },
        setEvent: function(key, val) {
            // console.log('setEvent: ');
            // console.log(key, val);
            mapper.set(key, val);
        }
    };

    switch (action.type) {
        case 'TAG_BALANCE':
            data = {
                coin_eth: action.payload.coin_eth,
                coin_con: action.payload.coin_con,
            };
            state.setEvent(action.type, data);
            return state.getEvent(action.type);
        case 'TAG_REQUESTER_FILE':
            if (action.payload.project_detail) {
                data = {
                    project_path: action.payload.project_detail
                }
            }
            console.log(action.payload.project_detail);
            state.setEvent(action.type, data);
            return state.getEvent(action.type);

        case 'TAG_REQUESTER_PROJECT':
            if (action.payload.project_id) {
                data = {
                    index: action.payload.index,
                    project_id: action.payload.project_id,
                    project_name: action.payload.project_name,
                    end_date: action.payload.end_date
                }
            }
            console.log('Project: ', action.payload);
            state.setEvent(action.type, data);
            return state.getEvent(action.type);

        case 'TAG_PROVIDER':
            data = {
                num_provided_tasks: action.payload.num_provided_tasks,
                num_under_pending: action.payload.num_under_pending,
            };
            state.setEvent(action.type, data);
            return state.getEvent(action.type);
        case 'TAG_NETWORK_STATUS':
            console.log('TAG_NETWORK_STATUS: ', action);
            data = {
                network_status: action.payload.network,
                online_nodes: action.payload.online_nodes,
            };
            state.setEvent(action.type, data);
            return state.getEvent(action.type);

        case 'TAG_APPLICATION_STATUS':
            data = {
                app_status: action.payload.app_status, // true / false
                app_location: action.payload.app_location, // home / conun / wallet / settings / mini
            };
            state.setEvent(action.type, data);
            return state.getEvent(action.type);

        case'TAG_CHANGE_WALLET_ADDR':
            data = {
                wallet_address: action.payload.wallet_address,
                private_key: action.payload.private_key
            };
            state.setEvent(action.type, data);
            return state.getEvent(action.type);

        default:
            return state;
    }
}

module.exports = {
    networkReduce
};
