const Store = require('electron-store');
const mainStore = new Store();
const { eventHunter, dispatchEvent } = require('conun-ipc/middleware/renderer.event.hunter');
const {ApplicationStorage} = require('../ui.objects')

var ProviderUIController = (function () {

    var DOMStrings = {
        setNetworkStatus: 'txt_network_status',
        setTxtNodeCount: 'txt_node_count',
        providerListArea: '.provider_list_area',
        divRefreshProject: 'resource_type-id',

        // project detail list id
        txtProjectName: 'project_name',
        txtProjectId: 'project_id',
        txtProjectStatus: 'project_status',
        txtTotalTasks: 'total_tasks',
        txtCompletedTasks: 'completed_tasks',
        txtPayType: 'pay_type',
        txtCredit: 'credit',
        txtResourceType: 'resource_type',
        txtRequesterUID: 'requester_uid',
        txtStartDate: 'start_date',
        txtEndDate: 'end_date',
        txtProjectDescription: 'project_description',

        btnSubmit: 'submit_btn',
        btnClose: 'close_btn'
    };

    return {
        addReqListItem: function(type, obj) {
            var html, newHtml, element;

            // console.log('addReqListItem: ', obj);

            if (type === 'add_provider_list') {
                element = DOMStrings.providerListArea;
                html =
                    '                  <tr id="list-%id%" class="dialoged" >\n' +
                    '                    <td id="project_name-id" title="Project Name">%project_name%</>\n' +
                    '                    <td id="project_Id-id" title="Project ID">%project_Id%</>\n' +
                    '                    <td id="credit-id" title="Credit">%credit%</>\n' +
                    '                    <td id="resource_type-id" title="Resource">%resource_type%</>\n' +
                    '                    <td id="work-id" title="%title_work%">%work%</>\n' +
                    '                    <td id="project_status-id" title="Status" class="stat">%project_status%</>\n' +
                    '                  </tr>';

                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('project_name-id', 'project_name-' + obj.id);
                newHtml = newHtml.replace('project_Id-id', 'project_Id-' + obj.id);
                newHtml = newHtml.replace('credit-id', 'credit-' + obj.id);
                newHtml = newHtml.replace('resource_type-id', 'resource_type-' + obj.id);
                newHtml = newHtml.replace('work-id', 'work-' + obj.id);
                newHtml = newHtml.replace('project_status-id', 'project_status-' +  obj.id);


                newHtml = newHtml.replace('%project_name%', obj.project_name);
                newHtml = newHtml.replace('%project_Id%', obj.project_id);
                newHtml = newHtml.replace('%credit%', obj.credit);
                newHtml = newHtml.replace('%resource_type%', obj.resource_type);
                newHtml = newHtml.replace('%work%', obj.work_time);
                newHtml = newHtml.replace('%title_work%', obj.work_time);
                newHtml = newHtml.replace('%project_status%', obj.project_status);
                document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            }
        },

        addProjectDetail: function(obj) {
            document.getElementById(DOMStrings.txtProjectName).innerHTML = obj.project_name,
            document.getElementById(DOMStrings.txtProjectId).innerHTML = obj.project_id,
            document.getElementById(DOMStrings.txtProjectStatus).innerHTML = obj.project_status,
            document.getElementById(DOMStrings.txtTotalTasks).innerHTML = obj.total_tasks,
            document.getElementById(DOMStrings.txtCompletedTasks).innerHTML = obj.completed_tasks,
            document.getElementById(DOMStrings.txtPayType).innerHTML = obj.pay_type,
            document.getElementById(DOMStrings.txtCredit).innerHTML = obj.credit,
            document.getElementById(DOMStrings.txtResourceType).innerHTML = obj.resource_type,
            document.getElementById(DOMStrings.txtRequesterUID).innerHTML = obj.requester_uid,
            document.getElementById(DOMStrings.txtStartDate).innerHTML = obj.start_date,
            document.getElementById(DOMStrings.txtEndDate).innerHTML = obj.end_date,
            document.getElementById(DOMStrings.txtProjectDescription).innerHTML = obj.project_description
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

    function ProjectConstructor() {
       this.selected_project_id = null;
       this.project_status = null;
       this.projectListMap = new Map();
       this.project = null;
    }

    // const projectListMap = new Map();
    var project_constructor = new ProjectConstructor();


    var setupEventListeners = function () {
        $(document).on("click",".provider_list_area", function () {
            providerProjectDetailList();
        });

        $('#close_btn').on('click', function() {
            $('#input_section').hide();
            $('.provider_list_area').empty();
            project_constructor.projectListMap.clear();
            providerProjectList();
        })

        $('#submit_btn').on('click', function() {
            submitProject();
            $('#input_section').hide();
            $('.provider_list_area').empty();
            project_constructor.projectListMap.clear();
            providerProjectList();
        })
    }

    // update screen if project received
    dispatchEvent.listener.on('CALLBACK_UPDATE_PROVIDER_UI',function () {
        console.log('CALLBACK_UPDATE_PROVIDER_UI');
        $('.provider_list_area').empty();
        project_constructor.projectListMap.clear();
        providerProjectList();
    })

    const submitProject = function () {
        if(project_constructor.project_status  !== 'SELECTED') {
            console.log('submitProject');
            project_constructor.project.event = 'PROVIDER_SELECTED_CONTENT';
            let object = JSON.parse(ApplicationStorage.getModel('APP_WALLET_ADDR'));
            console.log('APP_WALLET_ADDR: ', object);
            project_constructor.project.provider_uid = object.wallet_address;
            delete project_constructor.project.id;
            eventHunter.P2P_CHANNEL_REQ = {
                event: 'PROVIDER_SELECTED_CONTENT',
                value: {
                    project_id: project_constructor.selected_project_id,
                    project_status: 'SELECTED',
                    project: project_constructor.project
                }
            }
        } else {
            window.alert('Already Accepted')
        }
    }

    const getProjectList = function () {
        console.log('getProjectList');

        eventHunter.DATABASE_CHANNEL_REQ = {
            event: 'GET_ALL_PROJECT_LIST',
            value: null
        }

        return eventHunter.DATABASE_CHANNEL_RES;
    };


    // update view if opened
    var providerProjectList = function() {
        console.log('providerProjectList')
        getProjectList()
            .then( list => {
                if(list.event === 'SET_ALL_PROJECT_LIST')
                    list.value.forEach( function (table) {
                        // console.log('GET ALL LIST: ', table.dataValues.id, table.dataValues);
                        project_constructor.projectListMap.set(Number(table.dataValues.id), table.dataValues);
                        project_constructor.project = table.dataValues;
                        console.log('>> Project Item >> ', table.dataValues)
                        ProvUICtrl.addReqListItem('add_provider_list', {
                            id: table.dataValues.id,
                            project_name: table.dataValues.project_name,
                            project_id: table.dataValues.project_id,
                            credit: table.dataValues.credit,
                            resource_type: table.dataValues.resource_type,
                            work_time: table.dataValues.work_time,
                            project_status: table.dataValues.project_status
                        })
                    })
            })
    };

    var providerProjectDetailList = function () {
        $('#input_section').show();
        let select_project_area_id = event.target.id;
        let index = select_project_area_id.split("-");
        console.log('select_project: ', select_project_area_id, index[1]);

        let detail_list = project_constructor.projectListMap.get(Number(index[1]));
        // console.log('get detail_list: ', detail_list);
        project_constructor.selected_project_id = detail_list.project_id;
        project_constructor.project_status = detail_list.project_status;
        ProvUICtrl.addProjectDetail({
            project_name: detail_list.project_name,
            project_id: detail_list.project_id,
            project_status: detail_list.project_status,
            total_tasks: detail_list.total_tasks,
            pay_type: detail_list.pay_type,
            credit: detail_list.credit,
            resource_type: detail_list.resource_type,
            requester_uid: detail_list.requester_uid,
            start_date: detail_list.start_date,
            end_date: detail_list.end_date,
            project_description: detail_list.project_description,
        });
    }

    return {
        init: function () {
            console.log('PROVIDER');
            dispatchEvent.init('APPLICATION_CHANNEL_RES');
            setupEventListeners();
            providerProjectList();
        }
    }

})(ProviderUIController);

mainController.init();