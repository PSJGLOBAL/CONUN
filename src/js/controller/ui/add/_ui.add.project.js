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
        btnSubmitProject: '.btn_submit_project',

        divSelectArgument: 'argument_view_id',
        divSelectOneArgument: 'one_argument_id',

        // setArgMin: 'arg_min_FILE_HASH-0',
        // setArgMax: 'arg_max_FILE_HASH-0'
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

                // setArg_min: document.getElementById(DOMStrings.setArgMin),
                // setArg_max: document.getElementById(DOMStrings.setArgMax),

            };
        },

        addListItem: function(type, obj) {
            let html, newHtml, element;
            // console.log('addListItem: ', type, obj);
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
                        // '                    <td title="Reword Amount">%price_amount%</td>\n' +
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
                        '                  <!-- file list group start -->\n' +
                        '                  <tr id="project_list-%id%">\n' +
                        '                    <td>\n' +
                        '                      <input type="checkbox" name="taskfile_sel" id="task_FILE_HASH-%id%">\n' +
                        '                      <label for="task_FILE_HASH-%id%" class="checkbox"><span></span></label>\n' +
                        '                    </td>\n' +
                        '                    <td title="IPFS Hash Address">%file_hash%</td>\n' +
                        '                    <td title="File Local Path">%file_local_path%</td>\n' +
                        '                    <td title="File extension">%file_extension%</td>\n' +
                        // '                    <td title="Reword Amount">%price_amount%</td>\n' +
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
                    break;

                case 'remove_file':

                    break;

                case 'project_none':
                    // console.log('project_none');
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

        displayMultiArgumentSetting: function(state, length) {
            for(let id = 0; id<=length; id++) {
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
            var _project_detail = [];
            path.forEach(function (index) {
                let object = {
                    file_index: file_index ++,
                    project_path: index.project_path,
                    project_ext: index.project_ext
                };
                _project_detail.push(object);
            });
            // console.log('projectPacking: ', JSON.stringify(_project_detail));
            let project_detail = JSON.stringify(_project_detail);
            store.dispatch({ type: 'TAG_REQUESTER_FILE', payload: {project_detail}});
        },



        fileUpload: async function (path) {
            return new Promise (
                (resolve, reject) => {
                    // console.log('fileUpload: ', path);
                    let response = netIPFSUpload(path);
                    resolve(response);
                }
            );
        },


        projectCreate: async function (project) {
            return new Promise (
                (resolve, reject) => {
                   // console.log('projectCreate: ', project);
                   let response = netProjectCreate(project);
                   resolve(response);
                }
            );
        }


    };

})();



var setAddProjectController = (function (UICtrl, ActionCtrl) {

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
        this.file_count = null;
    }

    var project_settings = new Project_constructor();


    var setupEventListeners = async function () {
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

        //TODO file_count check
        document.getElementById(DOM.selectprojectType).addEventListener('change', function (element) {
            // console.log('element: ', element.target.value);
            switch (element.target.value) {
                case PROJECT_TYPE_0:
                    UICtrl.displayArgumentSetting(false);
                    UICtrl.displayOneArgumentSetting(false);
                    if(project_settings.file_count)
                        UICtrl.displayMultiArgumentSetting(true, project_settings.file_count);
                    break;

                case PROJECT_TYPE_1:
                    UICtrl.displayArgumentSetting(true);
                    UICtrl.displayOneArgumentSetting(false);
                    if(project_settings.file_count)
                        UICtrl.displayMultiArgumentSetting(true, project_settings.file_count);
                    break;

                case PROJECT_TYPE_2:
                    UICtrl.displayOneArgumentSetting(true);
                    UICtrl.displayArgumentSetting(false);
                    UICtrl.displayMultiArgumentSetting(false, project_settings.file_count);
                    break;

                case PROJECT_TYPE_3:
                    UICtrl.displayArgumentSetting(false);
                    UICtrl.displayOneArgumentSetting(false);
                    UICtrl.displayMultiArgumentSetting(true, project_settings.file_count);
                    break;
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

        for(let index = 0; index <= project_settings.file_count; index++) {
            var argument_min = $('#arg_min_FILE_HASH-'+[index]).val();
            var argument_max = $('#arg_max_FILE_HASH-'+[index]).val();
            // console.log('argument_min: ', argument_min);
            // console.log('argument_max: ', argument_max);
            // console.log('Argument Min: ', argument_min, index, project_settings.file_count);
            // console.log('Argument Max: ', argument_max, index, project_settings.file_count);
            if(argument_min && argument_max)
                project_settings.file_argument_map.set(index, argument_min + ' '+ argument_max);
            else
                project_settings.file_argument_map.set(index, '');
        }


        let project_format =
        {
            project_name : project_settings.project_name,
            project_description : project_settings.project_description,
            coin_type : project_settings.price_type.coin_type,
            coin_value : project_settings.price_type.price,
            start_date : moment().format('YYYY-MM-DD HH:m:s'),
            end_date : project_settings.end_date.date + ' ' + project_settings.end_date.time,
            project_type : project_settings.project_type,
            project_allocation_type : "3",
            node_count : String(project_settings.file_count + 1),
            file_hash : [],
            file_extension : [],
            argument : []
        };

        //TODO Change file hash, file extension, argument to one box file

        project_settings.file_hash_map.forEach((index, key) => {
            // console.log('File file_hash_map: ', key, index);
            project_format.file_hash[key] = index;
        });

        project_settings.file_extension_map.forEach((index, key) => {
           // console.log('file_extension_map: ', key, index);
            project_format.file_extension[key] = index;
        });

        project_settings.file_argument_map.forEach((index, key) => {
            // console.log('file_argument_map: ', key, index);
            project_format.argument[key] = index;
        });
        // console.log(JSON.stringify(project_format));
        LogReporter(project_format);
        let res_project = await ActionCtrl.projectCreate(project_format);
        if(res_project.msgType === 'PROJECT_CREATE_RES' && res_project.data.status === '0000') {
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
        var input, newItem;


        //TODO 1. get Input and project settings
        setProject(UICtrl.getInput());
        //TODO 2. Get add project files path
        let set_path = await AddProjectPath();
        // TODO 3Project save DB and update UI

        console.log('project_type.project_type: ', project_settings.project_type);
        console.log('project_settings.file_count: ', project_settings.file_count);
        console.log('set_path', set_path);

        if(project_settings.project_type > PROJECT_TYPE_1) {
            await ActionCtrl.projectPacking(set_path);
        }
        else if (project_settings.file_count === null) {
            let _set_path=[];
            _set_path.push(set_path[0]);
            console.log('_set_path: ', _set_path);
            await ActionCtrl.projectPacking(_set_path);
        }

        // let fileHash = await ActionCtrl.fileUpload();

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
