const {taskListSchema} = require("../task.model");
const { nodeModel, projectModel, taskInfoModel, taskListModel,
    osResourceModel, settingsModel, projectListModel } = require('../config/db.initalize');
module.exports = {
    accountCreate: (object) => {
        console.log('accountCreate: ', object);
        return nodeModel.create (
            {
                wallet_address: object.wallet_address,
                wallet_private_key: object.wallet_private_key,
                password: object.password
            }
        )
        .then( node => {
            console.log("Node generated: ", node.id);
            return true
        }).catch( error => {
            console.log("Could not create node. Please try again! " + error);
            return error
        });
    },

    checkNodeId : async (id) => {
        return new Promise (
            (resolve, reject) => {
                const object = nodeModel.findByPk(id)
                if(object) {
                    resolve(object)
                }
                else {
                    reject(object)
                }
            }
        )
    },

    updateSettingsByElement: (object) => {
        return settingsModel.update (
            {
                current_language: object.current_language,
                resource_control: object.resource_control,
                user_mode: object.user_mode,
                path: object.path,
                is_active: object.is_active
            },
            {where: {id: object.id}}
        ).then(data => {
            console.log("Settings updated", data);
            return data
        }).catch(error => {
            console.log("Error: ", error);
            return error
        });
    },

    createSettings: (object) => {
        console.log('createSettings: ', object);
        return settingsModel.create (
            {
                current_language: object.current_language,
                user_mode: object.user_mode,
                resource_control: object.resource_control,
                path: object.path,
                is_active: object.is_active
            }
        ).then(setting => {
            console.log("Settings created: ", setting);
            return setting
        }).catch(error => {
            console.log("Setting error: " + error);
            return error
        });
    },

    getSettingsByID: (id) => {
        return settingsModel.findByPk(id)
            .then(data => {
                //console.log("Find One getSettingsByID ", data);
                if(data === null) return null
                else return data
            }).catch(error => {
            //console.log("There no getSettingsByID ", error);
                return error
        });
    },


//tag: requester
    //todo update requester project list client
    requesterProjectCreate: (object) => {
        console.log('START1@-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=1@');
        console.log('requesterProjectCreate: ', object);

        //  todo save project all content
        //  save project save task list
       projectModel.create(
            {
                project_status: object.project_status,
                project_sequence: object.project_sequence,
                project_name: object.project_name,
                project_id: object.project_id,
                project_description: object.project_description,
                requester_uid:  object.requester_uid,
                resource_type:  object.resource_type,
                pay_type: object.pay_type,
                credit:  object.credit,
                start_date: object.start_date,
                end_date: object.end_date,
                total_tasks: object.total_tasks,
                completed_tasks: object.completed_tasks,
                task_created_date: object.task_created_date
            })
            .then( project => {
                console.log('-=-=-=-=-=-=-=-=-=-=-= S PROJECT LIST INFO -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
                console.log("project list info: ", object.task_info);
                    taskInfoModel.create({
                        task_id: object.task_info.task_id,
                        task_process_count: object.task_info.task_process_count,
                        task_process_mode: object.task_info.task_process_mode,
                        task_result_mode: object.task_info.task_result_mode,
                        task_created_date: object.task_info.task_crearted_date,
                    })
                console.log('-=-=-=-=-=-=-=-=-=-=-= E PROJECT LIST INFO -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
                console.log('-=-=-=-=-=-=-=-=-=-=-=- S TASK LIST INFO -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
                object.task_info.task_list.forEach(function (val, index) {
                        console.log('Task List: ', val, index)
                        taskListModel.create({
                            task_sub_id: val.task_sub_id,
                            provider_uid: val.provider_uid,
                            value: val.value,
                            status: val.status,
                            process_name: val.process_name
                        })
                    console.log('-=-=-=-=-=-=-=-=-=-=-=- S OS LIST INFO -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
                        val.os.forEach(function(val) {
                            console.log('os list: ', val);
                            osResourceModel.create( {
                                task_resource: val.task_resource,
                                process_loca: val.process_loca,
                                process_crc: val.process_crc
                            } )
                        })
                    })
                    console.log('-=-=-=-=-=-=-=-=-=-=-=- E OS LIST INFO -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
            console.log('END1@-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=1@');
            }).catch( error => {
                console.log("Could not create node. Please try again! " + error);
                return error
            });
    },



//tag: provider
    providerProjectListCreate: (object) => {
        console.log('providerProjectListCreate: ', object);
        return projectListModel.create (
            {
                project_status: object.project_status,
                project_sequence: object.project_sequence,
                project_name: object.project_name,
                project_id: object.project_id,
                project_description: object.project_description,
                requester_uid:  object.requester_uid,
                resource_type:  object.resource_type,
                pay_type: object.pay_type,
                credit:  object.credit,
                start_date: object.start_date,
                end_date: object.end_date,
                total_tasks: object.total_tasks,
                completed_tasks: object.completed_tasks,
                task_created_date: object.task_created_date
            }
        )
            .then( project => {
                console.log("Project List Created: ", project.id);
                return true
            }).catch( error => {
                console.log("Could not create node. Please try again! " + error);
                return error
            });
    },

    findAllProviderProjectList: () => {
        return new Promise (
            (resolve, reject) => {
               const object = projectListModel.findAll();
                if(object) {
                    console.log("All Project List: ", object);
                    resolve(object)
                }
                else {
                    reject(object)
                }
        });
    },


    updateProjectByElement: (object) => {
        return projectListModel.update (
            {
                project_status: object.project_status,
            },
            {where: {project_id: object.project_id}}
        ).then( data => {
            console.log("Updated", data);
            return data
        }).catch(error => {
            console.log("Error: ", error);
            return error
        });
    },


    providerProjectListDelete: () => {
        return projectListModel.destroy({where: { project_status: 'START' }})
            .then( project => {
                console.log("Project List deleted: ", project);
                return true
            }).catch( error => {
                console.log("Could not delete List. Please try again! " + error);
                return error
            });
    },
}

