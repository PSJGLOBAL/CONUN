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
            var html, newHtml, element;

            switch (type) {

                case 'none_project':
                    document.querySelector(DOMStrings.className).classList.toggle('notask');
                    break;

                case 'add_project':
                    document.querySelector(DOMStrings.className).classList.remove('notask');
                    element = DOMStrings.listProjectGroup;
                    html = ' <input type="radio" name="reqlist"  checked> <!-- CHECKED attribute is only for first item. -->\n' +
                        '            <label id="project_goup_list-id"  class="reqitem flex done"> <!-- if done disable cancel btn view -->\n' +
                        '              <span id="project_name-id" class="title mid"><img src="../../img/icon/ico_done_b.svg" alt="done project">%txt_project_name%</span> <!-- Project Hash -->\n' +
                        '              <span id="txt_project_hash-id">%txt_project_hash%</span> <!-- #Project Hash-->\n' +
                        '              <span id="txt_task_counts-id">%txt_task_count%</span> <!-- task count -->\n' +
                        '              <span id="txt_date-id" class="gray">%txt_end_date%</span> <!-- end_date ~ 0000-00-00, 00:00:00 (+UTC) -->\n' +
                        '              <span class="reqitem_btn">\n' +
                        '                <img src="../../img/icon/ico_etc.svg" alt="more" title="more">\n' +
                        '                <span>\n' +
                        '                  <button id="project_cancel-id" type="button" name="reqitem_btn_x" class="clear"><img src="../../img/icon/ico_cancel_10.svg" alt="cancel" title="cancel"> Cancel Project</button>\n' +
                        '                  <button id="project_delete-id" type="button" name="reqitem_btn_d" class="clear"><img src="../../img/icon/ico_trash.svg" alt="delete" title="delete"> Delete Project</button>\n' +
                        '                  <button id="project_resume-id" type="button" name="reqitem_btn_r" class="clear"><img src="../../img/icon/ico_resume.svg" alt="resume" title="resume"> Resume Project</button>\n' +
                        '                </span>\n' +
                        '              </span>\n' +
                        '            </label>';
                    // console.log('check add_project:',  obj); //project_name, end_date
                    newHtml = html.replace('%id%', obj.id);
                    newHtml = newHtml.replace('project_goup_list-id', 'project_goup_list-'+obj.id);
                    newHtml = newHtml.replace('project_name-id', 'project_name-'+obj.id);
                    newHtml = newHtml.replace('txt_project_hash-id', 'txt_project_hash-'+obj.id);
                    newHtml = newHtml.replace('txt_task_counts-id', 'txt_task_counts-'+obj.id);
                    newHtml = newHtml.replace('project_cancel-id', 'project_cancel-'+obj.id);
                    newHtml = newHtml.replace('project_delete-id', 'project_delete-'+obj.id);
                    newHtml = newHtml.replace('project_resume-id', 'project_resume-'+obj.id);
                    newHtml = newHtml.replace('txt_date-id', 'txt_date-'+obj.id);

                    newHtml = newHtml.replace('%txt_project_name%', obj.project_name);
                    newHtml = newHtml.replace('%txt_project_hash%', obj.project_id);
                    newHtml = newHtml.replace('%txt_end_date%', obj.end_date);
                    newHtml = newHtml.replace('%txt_task_count%', '0');
                    // console.log('project html:',  newHtml);
                    document.querySelector(element).insertAdjacentHTML('afterbegin', newHtml);
                    break;

                case 'update_project':

                    break;

                case 'add_task': //TODO  Fix task list
                    element = DOMStrings.listTaskGroup;
                    html =
                        '                    <tr id="task_goup_list-id">\n' +
                        '                    <td rowspan="3"><input type="checkbox" name="reqdetail_sel" id="btn_check_box-id"><label class="checkbox" for="_btn_check_box-id"><span></span></label></td>\n' +
                        '                    <td id="txt_task_status-id" rowspan="3" class="stat"></td>\n' +
                        '                    <td class="head">Task ID</td><td title="task id value">%task_id%</td>\n' +
                        '                  </tr>\n' +
                        '                  <tr><td class="head">Hash</td><td id="txt_file_hash-id">%file_hash%</td></tr>\n' +
                        '                  <tr><td class="head">Work Time</td><td id="txt_work_time-id"></td></tr>\n' +
                        '                  <tr><td class="head prov"></td><td class="prov" title="Click to Copy"><input type="readonly" onclick="copy(this);">%provider_wallet%</td></tr>';
                    let id = obj.id + 1;
                    // console.log('check task:',  id);
                    newHtml = html.replace('%id%', id);
                    newHtml = newHtml.replace('task_goup_list-id', 'task_goup_list-'+id);
                    newHtml = newHtml.replace('btn_check_box-id', 'btn_check_box-'+id);
                    newHtml = newHtml.replace('_btn_check_box-id', 'btn_check_box-'+id);
                    newHtml = newHtml.replace('txt_file_hash-id', 'txt_file_hash-'+id);
                    newHtml = newHtml.replace('txt_task_status-id', 'txt_task_status-'+id);
                    newHtml = newHtml.replace('txt_work_time-id', 'txt_work_time-'+id);

                    newHtml = newHtml.replace('%task_id%', obj.task_id);
                    newHtml = newHtml.replace('%file_hash%', obj.file_hash);
                    newHtml = newHtml.replace('%provider_wallet%', obj.wallet_address);
                    // console.log('task html:',  newHtml);
                    document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
                    document.getElementById('txt_task_status-'+id).innerText = obj.status;
                    document.getElementById('txt_work_time-'+id).innerText = obj.work_time;
                    break;

                default:
                    break;
            }
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
        set_path.forEach(function (file) {
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