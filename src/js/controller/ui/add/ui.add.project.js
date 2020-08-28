const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

const moment = require('moment');
const {LogReporter} = require('../../../utils/reporter');
const {netIPFSUpload, appListener, netProjectCreate} = require('../main/_ui.main');
const {AppRequester} = require('../../app/db/_storage.helper');

const { createStore, applyMiddleware } = require('redux');
const {
    forwardToMain,
    replayActionRenderer,
    getInitialStateRenderer,
    createAliasedAction,
} = require('electron-redux');
const {networkReduce} = require('../../app/event/_app.event.manager');

const initialState = getInitialStateRenderer();
const store = createStore(networkReduce, initialState, applyMiddleware(forwardToMain));
replayActionRenderer(store);

const PROJECT_TYPE_0 = '0'; //One Program, One Argument
const PROJECT_TYPE_1 = '1'; //One Program, Multi Argument
const PROJECT_TYPE_2 = '2'; //Multi Program, One Argument
const PROJECT_TYPE_3 = '3'; //Multi Program, Multi Argument

function Project_constructor() {
    this.project_name = null;
    this.project_type = null;
    this.project_description = null;
    this.end_date = {
        date: null,
        time: null
    };
    this.price_type = {
        coin_type: null,
        price: null
    };
    this.file_hash_map = new Map();
    this.file_extension_map = new Map();
    this.file_argument_map = new Map();
    this.fileArray = [];
    this.file_count = null;
    this.project_argument_len = 0;
}

var project_settings = new Project_constructor();

var addProjectUIController = (function () {

    var DOMStrings = {
        inTextProjectName: 'proj_name',
        selectprojectType: 'proj_type',
        inTextProjectDescription: 'txt_project_description',
        selectProjectEndDate: 'proj_date',
        selectProjectEndTime: 'proj_time',
        selectCoinType: 'proj_coin',
        selectPrice: 'proj_price',

        btnProjectPathFile: 'proj_path_file',
        addProjectPath: '.add_project_path',


        _addProjectPath: '._add_project_path',

        listAddProject: '.list_add_project',
        listMultiArgument: '.multi_argument_list',
        listMultiArgument_id: 'multi_argument_list_id',

        btnSubmitProject: '.btn_submit_project',

        divSelectArgument: 'argument_view_id',
        divSelectOneArgument: 'one_argument_id',

        intProjectArgument: 'proj_argument_id',
        btnAddArgument: 'add_argument_btn'
    };

    return {
        getInput: function() {
            return {
                project_name: document.getElementById(DOMStrings.inTextProjectName).value,
                project_type: document.getElementById(DOMStrings.selectprojectType).value,
                project_description: document.getElementById(DOMStrings.inTextProjectDescription).value,
                project_end_date: document.getElementById(DOMStrings.selectProjectEndDate).value,
                project_end_time: document.getElementById(DOMStrings.selectProjectEndTime).value,
                project_coin_type: document.getElementById(DOMStrings.selectCoinType).value,
                project_price: document.getElementById(DOMStrings.selectPrice).value,
                project_argument_len: document.getElementById(DOMStrings.intProjectArgument).value,

            };
        },

        addListItem: function(type, obj) {
            let html, newHtml, element;
            switch (type) {
                case 'add_file':
                    element = DOMStrings.listAddProject;
                    html =
                        '<table class="clear sub" cellpadding="0" cellspacing="0">\n' +
                        '                <tbody>\n' +
                        '                  <!-- file list group start -->\n' +
                        '                  <tr id="project_list-%id%">\n' +
                        '                    <td>\n' +
                        '                      <input type="checkbox" name="taskfile_sel" id="task_FILE_HASH-%id%">\n' +
                        '                      <label for="task_FILE_HASH-%id%" class="checkbox"><span></span></label>\n' +
                        '                    </td>\n' +
                        '                    <td title="IPFS Hash Address">%file_hash%</td>\n' +
                        '                    <td title="File Local Path">%file_local_path%</td>\n' +
                        '                    <td title="File extension">%file_extension%</td>\n' +
                        '                       <td class="proj_argument" id="argument_view_start-id">\n' +
                        '                           <button type="button" name="argument_control">-</button>\n' +
                        '                           <input type="number" class="proj_argument" name="proj_arg_min" id="arg_min_FILE_HASH-%id%" min="0" max="99" value="">\n' +
                        '                           <button type="button" name="argument_control">+</button>\n' +
                        '                       </td>\n' +
                        '                       <td class="proj_argument" id="argument_view_end-id">\n' +
                        '                           <button type="button" name="argument_control">-</button>\n' +
                        '                           <input type="number" class="proj_argument" name="proj_arg_max" id="arg_max_FILE_HASH-%id%" min="1" max="100" value="">\n' +
                        '                           <button type="button" name="argument_control">+</button>\n' +
                        '                       </td>\n' +
                        '                  </tr>\n' +
                        '                </tbody>\n' +
                        '              </table>';

                    newHtml = html.replace('%id%', obj.id);
                    newHtml = newHtml.replace('%file_hash%', obj.file_hash);
                    newHtml = newHtml.replace('%file_local_path%', obj.project_path);
                    newHtml = newHtml.replace('%file_extension%', obj.project_ext);
                    newHtml = newHtml.replace('argument_view_start-id', 'argument_view_start-'+ obj.id);
                    newHtml = newHtml.replace('argument_view_end-id', 'argument_view_end-'+ obj.id);
                    // newHtml = newHtml.replace('%price_amount%', obj.price_amount);
                    document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
                    break;

                case 'update_file':
                    element = DOMStrings.listAddProject;
                    html =
                        '<table class="clear sub" cellpadding="0" cellspacing="0">\n' +
                        '                <tbody>\n' +
                        '                  <tr id="project_list-%id%">\n' +
                        '                    <td>\n' +
                        '                      <input type="checkbox" name="taskfile_sel" id="task_FILE_HASH-%id%">\n' +
                        '                      <label for="task_FILE_HASH-%id%" class="checkbox"><span></span></label>\n' +
                        '                    </td>\n' +
                        '                    <td title="IPFS Hash Address">%file_hash%</td>\n' +
                        '                    <td title="File Local Path">%file_local_path%</td>\n' +
                        '                    <td title="File extension">%file_extension%</td>\n' +
                        '                       <td class="proj_argument" id="argument_view_start-id">\n' +
                        '                           <button type="button" name="argument_control" onclick="this.parentNode.querySelector(\'.proj_argument\').stepDown()">-</button>\n' +
                        '                           <input type="number" class="proj_argument" name="proj_arg_min" id="arg_min_FILE_HASH-%id%" min="0" max="254" value="">\n' +
                        '                           <button type="button" name="argument_control" onclick="this.parentNode.querySelector(\'.proj_argument\').stepUp()">+</button>\n' +
                        '                       </td>\n' +
                        '                       <td class="proj_argument" id="argument_view_end-id">\n' +
                        '                           <button type="button" name="argument_control" onclick="this.parentNode.querySelector(\'.proj_argument\').stepDown()">-</button>\n' +
                        '                           <input type="number" class="proj_argument" name="proj_arg_max" id="arg_max_FILE_HASH-%id%" min="1" max="255" value="">\n' +
                        '                           <button type="button" name="argument_control" onclick="this.parentNode.querySelector(\'.proj_argument\').stepUp()">+</button>\n' +
                        '                       </td>\n' +
                        '                  </tr>\n' +
                        '                </tbody>\n' +
                        '</table>';


                    newHtml = html.replace('%id%', obj.id);
                    newHtml = newHtml.replace('arg_min_FILE_HASH-%id%', 'arg_min_FILE_HASH-'+obj.id);
                    newHtml = newHtml.replace('arg_max_FILE_HASH-%id%', 'arg_max_FILE_HASH-'+obj.id);
                    newHtml = newHtml.replace('%file_hash%', obj.file_hash);
                    newHtml = newHtml.replace('%file_local_path%', obj.project_path);
                    newHtml = newHtml.replace('%file_extension%', obj.project_ext);
                    newHtml = newHtml.replace('argument_view_start-id', 'argument_view_start-'+ obj.id);
                    newHtml = newHtml.replace('argument_view_end-id', 'argument_view_end-'+ obj.id);
                    // newHtml = newHtml.replace('%price_amount%', obj.price_amount);
                    let element_id = 'project_list-%id%'.replace('%id%', obj.id);
                    document.getElementById(element_id).innerHTML = newHtml;
                    document.getElementById(DOMStrings.selectprojectType).disabled = true;
                    document.querySelector(DOMStrings.addProjectPath).disabled = true;
                    break;

                case 'multi_argument':
                    element = DOMStrings.listMultiArgument;
                    html =
                        '<table id="arg_table-id" class="clears1 sub" style="height:10px;">\n' +
                        '                        <tbody>\n' +
                        '                        <tr>\n' +
                        '                       <td>%index_multi_argument%</td>\n' +
                        '                       <td class="proj_argument" id="_argument_view_start-id">\n' +
                        '                           <button type="button" name="argument_control" onclick="this.parentNode.querySelector(\'.proj_argument\').stepDown()">-</button>\n' +
                        '                           <input type="number" class="proj_argument" name="proj_arg_min" id="arg_min_FILE_HASH-%id%" min="0" max="254" value="">\n' +
                        '                           <button type="button" name="argument_control" onclick="this.parentNode.querySelector(\'.proj_argument\').stepUp()">+</button>\n' +
                        '                       </td>\n' +
                        '                       <td class="proj_argument" id="_argument_view_end-id">\n' +
                        '                           <button type="button" name="argument_control" onclick="this.parentNode.querySelector(\'.proj_argument\').stepDown()">-</button>\n' +
                        '                           <input type="number" class="proj_argument" name="proj_arg_max" id="arg_max_FILE_HASH-%id%" min="1" max="255" value="">\n' +
                        '                           <button type="button" name="argument_control" onclick="this.parentNode.querySelector(\'.proj_argument\').stepUp()">+</button>\n' +
                        '                       </td>\n' +
                        '                        </tr>\n' +
                        '                        </tbody>\n' +
                        '</table>';

                    newHtml = html.replace('arg_table-id', 'arg_table-'+obj.id);
                    newHtml = newHtml.replace('%index_multi_argument%', obj.id);
                    newHtml = newHtml.replace('arg_min_FILE_HASH-%id%', 'arg_min_FILE_HASH-'+obj.id);
                    newHtml = newHtml.replace('arg_max_FILE_HASH-%id%', 'arg_max_FILE_HASH-'+obj.id);
                    newHtml = newHtml.replace('_argument_view_start-id', '_argument_view_start-'+ obj.id);
                    newHtml = newHtml.replace('_argument_view_end-id', '_argument_view_end-'+ obj.id);
                    document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
                    break;

                case 'project_none':
                    element = DOMStrings.listAddProject;
                    html =
                        '<div class="nodata flex" id="remove_nodata">\n' +
                        '<input type="file" multiple="multiple" name="proj_path_[]" id="proj_path_file">' +
                        '<button type="button" name="nodata" class="_add_project_path clear"><img src="../../img/icon/ico_attach.svg" alt="">&nbsp;Add Project Files</button>\n' +
                        '</div>';
                    document.querySelector(element).insertAdjacentHTML('beforeend', html);
                    break;

                default:
                    break;
            }

        },

        displayArgumentSetting: function(state) {
            let argumentView = document.getElementById(DOMStrings.divSelectArgument);
            if (state === true) argumentView.style.display = "block";
            else argumentView.style.display = "none";
        },

        displayOneArgumentSetting: function(state) {
            let argumentView = document.getElementById(DOMStrings.divSelectOneArgument);
            if (state === true) argumentView.style.display = "block";
            else argumentView.style.display = "none";
        },


        displayMultiArgumentSetting: function(state) {
            let argumentView = document.getElementById(DOMStrings.listMultiArgument_id);
            if (state === true) argumentView.style.display = "block";
            else argumentView.style.display = "none";
        },

        displayProjectArgumentSetting: function(state, length) {
            for(let id = 0; id <= length; id++) {
                console.log('displayProjectArgumentSetting: ', state, length);
                if(state === false) {
                    document.getElementById("argument_view_start-"+id).style.visibility = "hidden";
                    document.getElementById("argument_view_end-"+id).style.visibility = "hidden";
                } else {
                    document.getElementById("argument_view_start-"+id).style.visibility = "visible";
                    document.getElementById("argument_view_end-"+id).style.visibility = "visible";
                }
            }
        },

        getDOMstrings: function () {
            return DOMStrings;
        }
    }

})();


var projectController = (function () {
    let file_index = 0;

    return {
        calculateReword: function (price, count) {
            return price / count;
        },



        projectPacking: async function(path) {
            let project_detail = null;
            let object = null;
            var _project_detail = [];
            switch (project_settings.project_type) {
                case PROJECT_TYPE_0:
                    object = {
                        file_index: file_index ++,
                        project_path: path[0].project_path,
                        project_ext: path[0].project_ext
                    };
                    _project_detail.push(object);
                    project_detail = JSON.stringify(_project_detail);
                    store.dispatch({ type: 'TAG_REQUESTER_FILE', payload: {project_detail}});
                    break;

                case PROJECT_TYPE_1:
                    object = {
                        file_index: file_index ++,
                        project_path: path[0].project_path,
                        project_ext: path[0].project_ext
                    };
                    _project_detail.push(object);
                    project_detail = JSON.stringify(_project_detail);
                    store.dispatch({ type: 'TAG_REQUESTER_FILE', payload: {project_detail}});
                    break;

                case PROJECT_TYPE_2:
                    path.forEach(function (index) {
                        object = {
                            file_index: file_index ++,
                            project_path: index.project_path,
                            project_ext: index.project_ext
                        };
                        _project_detail.push(object);
                    });
                    project_detail = JSON.stringify(_project_detail);
                    store.dispatch({ type: 'TAG_REQUESTER_FILE', payload: {project_detail}});
                    break;

                case PROJECT_TYPE_3:
                    path.forEach(function (index) {
                        object = {
                            file_index: file_index ++,
                            project_path: index.project_path,
                            project_ext: index.project_ext
                        };
                        _project_detail.push(object);
                    });
                    project_detail = JSON.stringify(_project_detail);
                    store.dispatch({ type: 'TAG_REQUESTER_FILE', payload: {project_detail}});
                    break;
            }
            console.log('projectPacking: ', JSON.stringify(_project_detail));
        },



        fileUpload: async function (path) {
            return new Promise (
                (resolve, reject) => {
                    let response = netIPFSUpload(path);
                    resolve(response);
                }
            );
        },


        projectCreate: async function (project) {
            return new Promise (
                (resolve, reject) => {
                    let response = netProjectCreate(project);
                    resolve(response);
                }
            );
        },

        displaySelectedArgument: async function(argument) {
            console.log('PROJECT_TYPE: ', argument)
            switch (argument) {
                case PROJECT_TYPE_0:
                    console.log('PROJECT_TYPE_0')
                    addProjectUIController.displayArgumentSetting(false);
                    addProjectUIController.displayOneArgumentSetting(false);
                    addProjectUIController.displayMultiArgumentSetting(false);
                    break;

                case PROJECT_TYPE_1:
                    console.log('PROJECT_TYPE_1')
                    addProjectUIController.displayArgumentSetting(true);
                    addProjectUIController.displayOneArgumentSetting(false);
                    addProjectUIController.displayMultiArgumentSetting(true);
                    break;

                case PROJECT_TYPE_2:
                    console.log('PROJECT_TYPE_2')
                    addProjectUIController.displayOneArgumentSetting(true);
                    addProjectUIController.displayArgumentSetting(false);
                    addProjectUIController.displayMultiArgumentSetting(false);
                    break;

                case PROJECT_TYPE_3:
                    console.log('PROJECT_TYPE_3')
                    addProjectUIController.displayArgumentSetting(false);
                    addProjectUIController.displayOneArgumentSetting(false);
                    addProjectUIController.displayMultiArgumentSetting(false);
                    break;
            }
        },


    };

})();



var setAddProjectController = (function (UICtrl, ActionCtrl) {


    var setupEventListeners = async function (elementId) {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.addProjectPath).addEventListener('click', function (e) {
            e.preventDefault();
            document.getElementById(DOM.btnProjectPathFile).click();
            ctrlAddItem();
        });

        // TODO Check if project added to list
        document.querySelector(DOM._addProjectPath).addEventListener('click', function (e) {
            e.preventDefault();
            document.getElementById(DOM.btnProjectPathFile).click();
            ctrlAddItem();
        });

        document.querySelector(DOM.btnSubmitProject).addEventListener('click', submitProject);


        document.getElementById(DOM.selectprojectType).addEventListener('change', function (element) {
            ActionCtrl.displaySelectedArgument(element.target.value);
        })

        document.getElementById(DOM.btnAddArgument).addEventListener('click', function (elementId) {
            let arg_count = document.getElementById(DOM.intProjectArgument).value;

            if(project_settings.project_argument_len < arg_count) {
                for (let i = project_settings.project_argument_len; i < arg_count; i++) {
                    addProjectUIController.addListItem('multi_argument', {id: i})
                }
                project_settings.project_argument_len = document.getElementById(DOM.intProjectArgument).value;
            }
            else if(project_settings.project_argument_len > arg_count) {
                for (let s = arg_count; s < project_settings.project_argument_len; s++) {
                    var el = document.getElementById('arg_table-' + s);
                    el.parentNode.removeChild(el);
                }
                project_settings.project_argument_len = document.getElementById(DOM.intProjectArgument).value;
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
                        project_settings.fileArray.push(data);
                        set_path.push(data);
                    });
                    $('#remove_nodata').remove();
                    resolve(set_path);
                });
            }
        );
    };

    // Display update view
    var updateList = async function () {
        var projectArr = JSON.parse(appListener().getApp('project_path'));
        let file_map = new Map();
        let index_key = 0;

        async function displayList(type, element) {
            if (type === 'add_file') {
                projectArr.forEach((index) => {
                    file_map.set(index_key++, index);
                    UICtrl.addListItem('add_file', {
                        id: index.file_index,
                        file_hash: index.file_hash,
                        project_path: index.project_path,
                        project_ext: index.project_ext,
                        // price_amount: index.price_amount
                    });
                });
            } else if (type === 'update_file') {
                let file_box = {};
                let file_count = projectArr[projectArr.length-1].file_index;
                project_settings.file_count = file_count;
                let amount = ActionCtrl.calculateReword(project_settings.price_type.price,file_count + 1);

                for(index_key = 0; index_key < element.length; index_key++) {
                    file_box = file_map.get(index_key);
                    if (element[index_key].file_hash) file_box.file_hash = element[index_key].file_hash;
                    // if (amount) file_box.price_amount = amount;
                    file_map.set(index_key, file_box);
                }

                file_map.forEach((index) => {
                    project_settings.file_hash_map.set(index.file_index, index.file_hash);
                    project_settings.file_extension_map.set(index.file_index, index.project_ext);
                    UICtrl.addListItem('update_file', {
                        id: index.file_index,
                        file_hash: index.file_hash,
                        project_path: index.project_path,
                        project_ext: index.project_ext,
                        // price_amount: index.price_amount
                    });
                });

                if(project_settings.project_type === PROJECT_TYPE_1) {
                    console.log('PROJECT_TYPE_1 ----')
                    UICtrl.displayProjectArgumentSetting(false, project_settings.file_count);
                }
                if(project_settings.project_type === PROJECT_TYPE_2) {
                    UICtrl.displayProjectArgumentSetting(false, project_settings.file_count);
                }
            }
        }

        await displayList('add_file');
        let res_file = await ActionCtrl.fileUpload(projectArr);
        // LogReporter(res_file);
        await displayList('update_file', res_file.data);
    };

    var setProject = function(input) {
            project_settings.project_name = input.project_name;
            project_settings.project_type = input.project_type;
            project_settings.project_description = input.project_description;
            project_settings.end_date.date = input.project_end_date;
            project_settings.end_date.time = input.project_end_time;
            project_settings.price_type.coin_type = input.project_coin_type;
            project_settings.price_type.price = input.project_price;
    };

    var submitProject = async function () {
            console.log('submitProject >>', project_settings.file_count)
            //TODO GET PROJECT TYPE project_settings.project_type
        var argument_min = null;
        var argument_max = null
            if(project_settings.project_type === PROJECT_TYPE_0 || project_settings.project_type === PROJECT_TYPE_3) {
                for (let index = 0; index <= project_settings.file_count; index++) {
                    argument_min = $('#arg_min_FILE_HASH-' + [index]).val();
                    argument_max = $('#arg_max_FILE_HASH-' + [index]).val();
                    console.log('argument: ', argument_min, argument_max)
                    if (argument_min && argument_max)
                        project_settings.file_argument_map.set(index, argument_min + ' ' + argument_max);
                    else
                        project_settings.file_argument_map.set(index, '');
                }
            }
            else if(project_settings.project_type === PROJECT_TYPE_1) {
                for (let index = 0; index < project_settings.project_argument_len; index++) {
                    argument_min = $('#arg_min_FILE_HASH-' + [index]).val();
                    argument_max = $('#arg_max_FILE_HASH-' + [index]).val();
                    console.log('argument: ', argument_min, argument_max)
                    if (argument_min && argument_max)
                        project_settings.file_argument_map.set(index, argument_min + ' ' + argument_max);
                    else
                        project_settings.file_argument_map.set(index, '');
                }
            }
            else if(project_settings.project_type === PROJECT_TYPE_2) {
                    argument_min = $('#arg_min_FILE_HASH').val();
                    argument_max = $('#arg_max_FILE_HASH').val();
                    console.log('argument: ', argument_min, argument_max)
                    if (argument_min && argument_max)
                        project_settings.file_argument_map.set(0, argument_min + ' ' + argument_max);
                    else
                        project_settings.file_argument_map.set(0, '');
            }



            let project_format =
                {
                    project_name: project_settings.project_name,
                    project_description: project_settings.project_description,
                    coin_type: project_settings.price_type.coin_type,
                    coin_value: project_settings.price_type.price,
                    start_date: moment().format('YYYY-MM-DD HH:m:s'),
                    end_date: project_settings.end_date.date + ' ' + project_settings.end_date.time,
                    project_type: project_settings.project_type,
                    project_allocation_type: "3",
                    node_count: String(project_settings.file_count + 1),
                    file_hash: [],
                    file_extension: [],
                    argument: []
                };

            //TODO Change file hash, file extension, argument to one box file

            project_settings.file_hash_map.forEach((index, key) => {
                project_format.file_hash[key] = index;
            });

            project_settings.file_extension_map.forEach((index, key) => {
                project_format.file_extension[key] = index;
            });

            project_settings.file_argument_map.forEach((index, key) => {
                project_format.argument[key] = index;
            });

            console.log('project_format: ', project_format)
            LogReporter(project_format);
            let res_project = await ActionCtrl.projectCreate(project_format);
            if (res_project.msgType === 'PROJECT_CREATE_RES' && res_project.data.status === '0000') {
                AppRequester.addProject({
                    project_id: res_project.data.project_id,
                    project_name: project_format.project_name,
                    start_date: project_format.start_date,
                    end_date: project_format.end_date
                });
                ipcRenderer.send('requester-add-project', 'add-project');
                window.close();
            } else {
                ipcRenderer.send('requester-add-project', 'add-project-fail');
            }
    };

    var ctrlAddItem = async function () {
        let get_input = UICtrl.getInput();
        setProject(get_input);

        let set_path = await AddProjectPath();

        await ActionCtrl.projectPacking(set_path);
    };


    return {
        init: function () {
            console.log('Add Project Started');
            UICtrl.addListItem('project_none');
            UICtrl.displayArgumentSetting(false);
            UICtrl.displayOneArgumentSetting(false);
            store.subscribe(updateList);
            setupEventListeners().catch(e => console.log('Add Project Can not listen: ', e));
        }
    }

})(addProjectUIController, projectController);

setAddProjectController.init();
