const fs = require('fs');
const  { eventHunter, EventSubscriber, dispatchEvent } = require('conun-ipc/middleware/renderer.event.hunter')
function Project_constructor() {
    this.project_name = null;
    this.end_date = {
        date: null,
        time: null
    };
    this.price_type = {
        coin_type: null,
        price: null
    };
    this.fileArray = [];
    this.file_count = null;
    this.project_status = null;
}

var project_details = new Project_constructor();

var RequesterUIController = (function () {

    var DOMStrings = {
        setNetworkStatus: 'txt_network_status',
        setTxtNodeCount: 'txt_node_count',
        btnAddProject: '.btn_addProject',
        _btnAddProject: '._btn_addProject',
        btnDownloadTasks: 'btn_download_tasks',

        btnProjectPathFile: 'proj_path_file',

        className: '.id_class_change',
        listProjectGroup: '.list_project_group',
        listTaskGroup: '.list_task_area',
    };

    return {
        getInput: function() {
            return {};
        },

        addListItem: function(type, obj) {

        },

        displayRequester: function() {
            console.log('Requester display >>');
            //document.getElementById(DOMStrings.setNetworkStatus).innerHTML = appListener().getApp('network_status');
            //document.getElementById(DOMStrings.setTxtNodeCount).innerHTML = appListener().getApp('online_nodes');
        },

        getDOMstrings: function () {
            return DOMStrings;
        }
    }

})();

var mainController = (function (ReqUICtrl) {
    document.querySelector(ReqUICtrl.getDOMstrings().className).classList.toggle('notask');

    var setupEventListeners =  function () {
        var DOM = ReqUICtrl.getDOMstrings();

        document.querySelector(DOM.btnAddProject).addEventListener('click', async function (e) {
            e.preventDefault();
            console.log('clicked');
            document.getElementById(DOM.btnProjectPathFile).click();
            await ctrlAddItem();
        });

        document.querySelector(DOM._btnAddProject).addEventListener('click', async  function (e) {
            e.preventDefault();
            console.log('clicked');
            document.getElementById(DOM.btnProjectPathFile).click();
            await ctrlAddItem();
        });

        var dropZone = document.getElementById('drop_zone');
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileSelect, false);
    };

    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        let files = evt.dataTransfer.files; // FileList object.
        console.log('files: ', typeof files, files);
        Object.values(files).forEach(file => {
            console.log('files: ', typeof file, file);
            try {
                let data = fs.readFileSync(file.path, 'utf8');
                console.log('data: ', JSON.parse(data))
                eventHunter.P2P_CHANNEL_REQ = {
                    event: 'P2P-UPLOAD-PROJECT',
                    value: JSON.parse(data)

                }
            } catch(e) {
                console.log('Error:', e.stack);
                throw e
            }
        })
    }

    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }


    var ctrlAddItem = async function () {
        let set_path = await AddProjectPath();
        console.log('files: ', typeof set_path, set_path);
        set_path.forEach(function (file, index) {
            try {
                let data = fs.readFileSync(file.project_path, 'utf8');
                console.log('data: ', JSON.parse(data))
                eventHunter.P2P_CHANNEL_REQ = {
                    event: 'P2P-UPLOAD-PROJECT',
                    value: JSON.parse(data)
                }
            } catch(e) {
                console.log('Error:', e.stack);
                throw e
            }
        })
    };

    // Add Project btn
    var AddProjectPath = function () {
        return new Promise (
            (resolve, reject) => {
                $('#proj_path_file').on('change', function() {
                    var files = $(this).prop("files");
                    var path = $.map(files, function(val) { return val.path; });
                    let set_path = [];
                    path.forEach(function (index) {
                        let ini, extension;
                        ini = index.lastIndexOf('.');
                        extension = index.slice(ini);
                        if(ini === -1) {
                            extension = ''
                        }
                        let data = {
                            project_path: index,
                            project_ext: extension
                        };
                        project_details.fileArray.push(data);
                        set_path.push(data);
                    });
                    $('#remove_nodata').remove();
                    resolve(set_path);
                });
            }
        );
    };

    return {
        init: function () {
            console.log('CONUN REQUESTER Started');
            ReqUICtrl.displayRequester();
            setupEventListeners();
        }
    }

})(RequesterUIController);

mainController.init();