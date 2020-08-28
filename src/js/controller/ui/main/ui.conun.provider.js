const Store = require('electron-store');
const mainStore = new Store();


var ProviderUIController = (function () {

    var DOMStrings = {
        setNetworkStatus: 'txt_network_status',
        setTxtNodeCount: 'txt_node_count',
        providerListArea: '.provider_list_area'
    };

    return {
        addReqListItem: function(type, obj) {
            var html, newHtml, element;

            if (type === 'add_provider_list') {
                element = DOMStrings.providerListArea;
                html =
                    '                  <tr id="list-%id%">\n' +
                    '                    <td title="Project Title">%txt_project_name%</td>\n' +
                    '                    <td title="Task ID">%txt_task_id%</td>\n' +
                    '                    <td title="File Hash">%txt_file_hash%</td>\n' +
                    '                    <td title="Date: %txt_date%">%txt_end_date%</td>\n' +
                    '                    <td id="task_status-id" title="Status" class="stat">%txt_status%</td>\n' +
                    '                    <td id="task_tx_hash-id" title="Click to copy"><input type="readonly" onclick="copy(this);">%txt_tx_hash%</td>\n' +
                    '                  </tr>';
                console.log('check provide:',  obj);
                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%txt_project_name%', obj.project_name);
                newHtml = newHtml.replace('%txt_task_id%', obj.task_id);
                newHtml = newHtml.replace('%txt_file_hash%', obj.file_hash);
                newHtml = newHtml.replace('%txt_date%', obj.date.start_date + '~' + obj.date.end_date);
                newHtml = newHtml.replace('%txt_end_date%', obj.date.end_date);
                newHtml = newHtml.replace('%txt_status%', obj.status);
                newHtml = newHtml.replace('task_status-id', 'task_status-' + obj.id);
                newHtml = newHtml.replace('%txt_tx_hash%', obj.tx_hash);
                newHtml = newHtml.replace('task_tx_hash-id', 'task_tx_hash-' + obj.id);
                console.log(element, newHtml);
                document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            }
        },

        displayProvider: function() {
            console.log('Requester display >>');
            document.getElementById(DOMStrings.setNetworkStatus).innerHTML = appListener().getApp('network_status');
            document.getElementById(DOMStrings.setTxtNodeCount).innerHTML = appListener().getApp('online_nodes');
        },

        getDOMstrings: function () {
            return DOMStrings;
        }
    }
})();


var mainController = (function (ProvUICtrl) {

    // update view if opened
    var addProviderTaskList = function(object) {

    };


    return {
        init: function () {
            console.log('PROVIDER');
            ProvUICtrl.displayProvider();
        }
    }

})(ProviderUIController);

mainController.init();