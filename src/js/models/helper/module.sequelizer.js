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
        return new Promise(
            ((resolve, reject) => {
                settingsModel.update (
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
                    resolve(data)
                }).catch(error => {
                    console.log("Error: ", error);
                    reject(error)
                });
            })
        )
    },

    createSettings: (object) => {
        console.log('createSettings: ', object);
        return new Promise(
            ((resolve, reject) => {
                settingsModel.create(
                    {
                        current_language: object.current_language,
                        user_mode: object.user_mode,
                        resource_control: object.resource_control,
                        path: object.path,
                        is_active: object.is_active
                    }
                ).then(setting => {
                    console.log("Settings created: ", setting);
                    resolve(setting)
                }).catch(error => {
                    console.log("Setting error: " + error);
                    reject(error)
                })
            })
        )
    },

    getSettingsByID: (id) => {
        return new Promise(
            ((resolve, reject) => {
                settingsModel.findByPk(id)
                    .then(data => {
                        if(data === null)
                            resolve(null)
                        else resolve(data)
                    }).catch(error => {
                    throw error
                    // reject(error)
                });
            })
        )
    },


//tag: requester
    requesterProjectCreate: (object) => {
        return new Promise (
        (resolve, reject) => {
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
                .then( project_content => {
                    taskInfoModel.create({
                        task_id: object.task_info.task_id,
                        task_process_count: object.task_info.task_process_count,
                        task_process_mode: object.task_info.task_process_mode,
                        task_result_mode: object.task_info.task_result_mode,
                        task_created_date: object.task_info.task_crearted_date,
                        projectModelId: project_content.id
                    }).then( project_body => {
                        object.task_info.task_list.forEach(function (val, index) {
                            taskListModel.create({
                                task_sub_id: val.task_sub_id,
                                provider_uid: val.provider_uid,
                                value: val.value,
                                status: val.status,
                                process_name: val.process_name,
                                taskInfoModelId: project_body.id
                            }).then( task_list => {
                                val.os.forEach(function(val) {
                                    osResourceModel.create({
                                        task_resource: val.task_resource,
                                        process_loca: val.process_loca,
                                        process_crc: val.process_crc,
                                        taskListModelId: task_list.id
                                    }).then(os_list => {
                                        resolve(true)
                                    }).catch(task_list => {
                                        reject(false)
                                    })
                                })
                            }).catch(err => {
                                reject(false);
                            })
                        })
                    }).catch( err => {
                        projectModel.destroy({where: { project_id: object.project_id }})
                        reject(false);
                    });
                }).catch( error => {
                reject(false);
            });
        });
    },

//tag: requester
    requesterUpdateProjectList: (object) => {
        return new Promise (
            (resolve, reject) => {

            })
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

