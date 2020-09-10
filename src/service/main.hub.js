const events = require('events');
const p2ptoMainChannel = new events.EventEmitter();
const mainToMainChannel = new events.EventEmitter();
module.exports = {
    p2ptoMainChannel,
    mainToMainChannel
}