import {isInstalled} from "./ui.metamask.api.js";
// import config from "../../../../../js/config/default";


var txt_wallet_address = document.getElementById('txt_wallet_address');


const socket = new WebSocket('ws://127.0.0.1:9090');

socket.onopen = () => console.log('Connected');
    // || setInterval(() => socket.send(new Date().toLocaleString()), 1000);


// socket.onmessage = async function (message) {
// };

// socket.onopen = async function () {
//     let data = {
//         web_client: 'META_IMPORT_WALLET_RES',
//         data: {
//             wallet_address: 'wallet_address'
//         }
//     };
//     await socket.send(JSON.stringify(data));
// };

socket.onerror = function (error) {
    console.log('WebSocket error: ' + error);
};


const target = {
    request: null,
    response: null
};

const handler = {

    set: async (target, objectKey, value) => {
        if(objectKey === 'request') {
            target[objectKey] = value;
            console.log('request: ',value);
            // socket.onopen = async function () {
                console.log('request: 1', target[objectKey]);
                await socket.send(JSON.stringify(target[objectKey]));
                return true;
            // }
        }
    },

    get: async (target, objectKey) => {
        if (objectKey === 'response') {
        return new Promise (
            (resolve => {
                socket.onmessage = async function (message) {
                    target[objectKey] = message.data;
                    resolve(target[objectKey]);
                };
            })
        )
        }
    }
};

const ws_forward = new Proxy(target, handler);

async function MetaMaskWS() {
    let getRes = await ws_forward.response;
    console.log('>>>>>>> getRes: ', getRes);
    let wallet_address;
    if (getRes === '{"msgType":"META_IMPORT_WALLET_REQ"}') {
        wallet_address = await isInstalled();
        console.log('wallet_address ', wallet_address);
        if(wallet_address) {
            txt_wallet_address.innerHTML += wallet_address + '<br />';
                let data = {
                    msgType: 'META_IMPORT_WALLET_RES',
                    data: {
                        wallet_address: wallet_address
                    }
                };
                ws_forward.request = data;

        } else {

            socket.onopen = async function () {
                let data = {
                    msgType: 'Metamask not installed yet'
                };
                await socket.send(JSON.stringify(data));
            };
        }
    }

    // switch (getRes) {
    //     case 'META_IMPORT_WALLET_REQ':
    //         wallet_address = await isInstalled();
    //         console.log('wallet_address ', wallet_address);
    //         if(wallet_address) {
    //             txt_wallet_address.innerHTML += wallet_address + '<br />';
    //
    //                     socket.onopen = async function () {
    //                         let data = {
    //                             msgType: 'META_IMPORT_WALLET_RES',
    //                             data: {
    //                                 wallet_address: wallet_address
    //                             }
    //                         };
    //                         await socket.send(JSON.stringify(data));
    //                     };
    //         } else {
    //
    //             socket.onopen = async function () {
    //                 let data = {
    //                     msgType: 'Metamask not installed yet'
    //                 };
    //                 await socket.send(JSON.stringify(data));
    //             };
    //         }
    //         break;
    //
    //     case 'META_OPEN_WALLET_REQ':
    //         wallet_address = await isInstalled();
    //         if(wallet_address) {
    //             txt_wallet_address.innerHTML += wallet_address + '<br />';
    //
    //             socket.onopen = async function () {
    //                 let data = {
    //                     msgType: 'META_OPEN_WALLET_RES',
    //                     data: {
    //                         wallet_address: wallet_address
    //                     }
    //                 };
    //                 await socket.send(JSON.stringify(data));
    //             };
    //         } else {
    //             socket.onopen = async function () {
    //                 let data = {
    //                     msgType: 'Metamask not installed yet'
    //                 };
    //                 await socket.send(JSON.stringify(data));
    //             };
    //         }
    //     break;
    //
    //     case 'META_GET_BALANCE_REQ':
    //     break;
    //
    //     case 'META_REQ':
    //     break;
    // }

}

(async () => {
    await MetaMaskWS();
})();
