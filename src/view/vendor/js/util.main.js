const jsPDF = require('jspdf');


var doc = new jsPDF();

var specialElementHandlers = {
    '#content': function (element, renderer) {
        return true;
    }
};

$('#btnPdfSaver').click(function (res) {
    doc.fromHTML($('#content').html(), 45, 25, {
        'width': 170,
        'elementHandlers': specialElementHandlers
    }, function  (dispose) {
        console.log('btnPdfSaver: ', dispose);
                    doc.save(`conun_account_qrcode.pdf`);
                    console.log('res: ', res);
  });
});
