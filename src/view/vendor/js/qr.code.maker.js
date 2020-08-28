const { ApplicationStorage } = require('../../../js/controller/ui/ui.objects');

$(document).ready(function(){
    var h = $(window).height();
    $('section#popup').css({'height':h});
});
// qrcodes
// var user_uid_qrcode = new QRCode("user_uid", {
//     width: 120,
//     height: 120,
//     colorDark : "#000000",
//     colorLight : "#ffffff",
//     correctLevel : QRCode.CorrectLevel.H
// });
// var user_pub_key_qrcode = new QRCode("user_pub_key", {
//     width: 120,
//     height: 120,
//     colorDark : "#000000",
//     colorLight : "#ffffff",
//     correctLevel : QRCode.CorrectLevel.H
// });
// var user_priv_key_qrcode = new QRCode("user_priv_key", {
//     width: 120,
//     height: 120,
//     colorDark : "#000000",
//     colorLight : "#ffffff",
//     correctLevel : QRCode.CorrectLevel.H
// });


// =-=-=-=-=-=
var conun_account_qrcode = new QRCode("conun_account", {
    width: 120,
    height: 120,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
});

console.log(ApplicationStorage.getModel('QR_CODE_SHARE'));
let data = ApplicationStorage.getModel('QR_CODE_SHARE');

let qr_string = {
  node_uid: data.node_uid,
  wallet_address: data.wallet_address,
  private_key: data.private_key
};
console.log(JSON.stringify(qr_string));

conun_account_qrcode.makeCode(JSON.stringify(qr_string));

// user_uid_qrcode.makeCode(data.node_uid);
// user_pub_key_qrcode.makeCode(data.wallet_address);
// user_priv_key_qrcode.makeCode(data.private_key);
