const {taskListSchema} = require("../task.model");
const moment = require('moment');
const { nodeModel, projectModel, taskInfoModel, taskListModel,
    osResourceModel, settingsModel, dataServerModel } = require('../config/db.initalize');

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
        return new Promise (
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
                    user_mode: 'REQUESTER_MODE',
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
                    dataServerModel.create({
                        ip: object.data_server_info.ip,
                        port: object.data_server_info.port,
                        account: object.data_server_info.account,
                        password: object.data_server_info.password,
                        projectModelId: project_content.id
                    }).then(data_server  => {
                        console.log('>> data_server: ', data_server)
                    }).catch(err => {
                        console.log('>> data_server err', err)
                        reject(false);
                    })
                    taskInfoModel.create({
                        task_id: object.task_info.task_id,
                        task_process_count: object.task_info.task_process_count,
                        task_process_mode: object.task_info.task_process_mode,
                        task_result_mode: object.task_info.task_result_mode,
                        task_created_date: object.task_info.task_crearted_date,
                        projectModelId: project_content.id
                    }).then( project_body => {
                        console.log('>> project_body:', project_body)
                        object.task_info.task_list.forEach(function (val, index) {
                            taskListModel.create({
                                task_sub_id: val.task_sub_id,
                                provider_uid: val.provider_uid,
                                value: val.value,
                                status: val.status,
                                process_name: val.process_name,
                                para_info_loca: val.para_info_loca,
                                data_loca: val.data_loca,
                                data_CRC: val.data_CRC,
                                cre_date: val.cre_date,
                                work_time:  val.work_time,
                                taskInfoModelId: project_body.id
                            }).then( task_list => {
                                console.log('>> task_list:', task_list)
                                val.os.forEach(function(value) {
                                    osResourceModel.create({
                                        task_resource: value.task_resource,
                                        process_loca: value.process_loca,
                                        process_crc: value.process_crc,
                                        taskListModelId: task_list.id
                                    })
                                    .catch(err => {
                                        console.log('>> osResourceModel err:', err)
                                        reject(false)
                                    })
                                })
                                resolve(true);
                            }).catch(err => {
                                console.log('>> task_list err:', err)
                                reject(false);
                            })
                        })
                    }).catch( err => {
                        console.log('>> project_body err:', err)
                        projectModel.destroy({where: { project_id: object.project_id }})
                        reject(false);
                    });
                }).catch( error => {
                reject(false);
            });
        });
    },

//tag: requester
    requesterUpdateUID: (object) => {
        return new Promise (
            (resolve, reject) => {
                projectModel.findOne({where: { project_id: object.project_id }})
                    .then(project => {
                        taskListModel.findOne(
                            {
                                where: {
                                    taskInfoModelId: project.id,
                                    status: 'NONE'
                                }
                            }
                        ).then(task_object =>  {
                            taskListModel.update(
                                {
                                    provider_uid: object.provider_uid,
                                    status: object.status,
                                },
                                { where: { task_sub_id: task_object.task_sub_id }}
                            ).then( () => {
                                resolve(task_object.id)
                            }).catch(  err =>  {
                                reject(false)
                            })
                        })
                    }).catch( err => {
                    console.log('projectModel Err: ', err);
                })
            })
    },

//tag: requester
    getSelectedProjectById: (object) => {
        let response = {};
        console.log('getSelectedProjectById: ', object)
        return new Promise (
            ((resolve, reject) => {
                projectModel.findOne({where: { project_id: object.project_id }})
                    .then( project => {
                        response = project.dataValues
                        delete response.createdAt
                        delete response.updatedAt
                        console.log('>>  project: ', response);
                        taskInfoModel.findOne({
                            where: {
                                projectModelId: project.dataValues.id
                            }
                        })
                        .then(_task_info => {
                            response.task_info = _task_info.dataValues
                            console.log('>> task_info: ', response.task_info)

                            taskListModel.findOne(
                                {
                                    where: {
                                        taskInfoModelId: _task_info.dataValues.id,
                                        status: 'SELECTED'
                                    }
                                }
                            ).then( task => {

                                osResourceModel.findOne(
                                    {
                                        where: {
                                            taskListModelId: task.dataValues.id,
                                            task_resource: object.os
                                        }
                                    }
                                ).then( os_resource => {
                                    console.log('os_resource: ', os_resource);
                                    let _task = task.dataValues
                                    _task.os = os_resource.dataValues;

                                    delete _task.id
                                    delete _task.createdAt
                                    delete _task.updatedAt
                                    delete _task.os.id
                                    delete _task.os.createdAt
                                    delete _task.os.updatedAt

                                    let task_list = [];
                                    task_list.push(_task);
                                    response.task_info.task_list = task_list;
                                    console.log('>> task_list: ', response.task_info.task_list)
                                    dataServerModel.findOne(
                                        {
                                            where: {
                                                projectModelId: project.dataValues.id
                                            }
                                        }
                                    ).then( data_server => {
                                        response.data_server_info = data_server.dataValues
                                        console.log('>> data_server: ', response);
                                        resolve(response)
                                    })

                                })
                            })
                        })
                    }).catch( err => {
                        console.log('Err', err);
                        reject(err)
                })
            })
        )
    },

//tag: provider
    providerProjectListCreate: (object) => {
        console.log('providerProjectListCreate: ', object);
        return projectModel.create(
            {
                user_mode: 'PROVIDER_MODE',
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
               projectModel.findAll({
                   where: {  user_mode: 'PROVIDER_MODE' }
               })
               .then(object => {
                   console.log("All Project List: ", object);
                   resolve(object)
               })
               .catch(err => {
                   console.log('err: ', err)
                   reject(err)
               })
        });
    },

    updateProjectByElement: (object) => {
        return projectModel.update(
            {
                project_status: object.project_status,
            },
            {  where: {  project_id: object.project_id }}
        ).then( data => {
            console.log("Updated", data);
            return data
        }).catch(error => {
            console.log("Error: ", error);
            return error
        });
    },

//tag: provider
    providerProjectListDelete: () => {
        return projectModel.destroy({where: { project_status: 'START', user_mode: 'PROVIDER_MODE' }})
            .then( project => {
                console.log("Project List deleted: ", project);
                return true
            }).catch( error => {
                console.log("Could not delete List. Please try again! " + error);
                return error
            });
    },

//tag: provider
    providerUpdateProjectInfo: (object) =>  {
        return new Promise (
            (resolve, reject) => {
                console.log('_get object >>  ', object);
            projectModel.findOne({where: { project_id: object.project_id }})
                .then(project => {
                    projectModel.update(
                        {
                            end_date: object.end_date,
                            completed_tasks: 1,
                        },
                        { where: { id: project.dataValues.id, user_mode: project.dataValues.user_mode }}
                    ).then( () => {
                        console.log('project updated >>')
                        dataServerModel.create({
                            ip: object.data_server_info.ip,
                            port: object.data_server_info.port,
                            account: object.data_server_info.account,
                            password: object.data_server_info.password,
                            projectModelId: project.dataValues.id
                        }).then(data_server  => {
                            console.log('>> data_server: ', data_server)
                        }).catch(err => {
                            console.log('>> data_server err', err)
                            reject(false);
                        })

                        taskInfoModel.create({
                            task_id: object.task_info.task_id,
                            task_process_count: object.task_info.task_process_count,
                            task_process_mode: object.task_info.task_process_mode,
                            task_result_mode: object.task_info.task_result_mode,
                            task_created_date: object.task_info.task_created_date,
                            projectModelId: project.dataValues.id
                        }).then( task_info => {
                            console.log('_task_info >>', task_info.dataValues)
                            object.task_info.task_list.forEach(function (val, index) {
                                taskListModel.create({
                                    task_sub_id: val.task_sub_id,
                                    provider_uid: val.provider_uid,
                                    value: val.value,
                                    status: 'DONE_STATUS',
                                    process_name: val.process_name,
                                    para_info_loca: val.para_info_loca,
                                    data_loca: val.data_loca,
                                    data_CRC: val.data_CRC,
                                    cre_date: val.cre_date,
                                    work_time: moment.utc(moment(object.end_date,"YYYY-MM-DD HH:mm:ss").diff(moment(object.start_date,"YYYY-MM-DD HH:mm:ss"))).format("HH:mm:ss"),
                                    taskInfoModelId: task_info.dataValues.id,
                                }).then( task_list => {
                                   osResourceModel.create({
                                        task_resource: val.os.task_resource,
                                        process_loca: val.os.process_loca,
                                        process_crc: val.os.process_crc,
                                        taskListModelId: task_list.dataValues.id
                                   })
                                    resolve(true);
                                }).catch(err => {
                                    console.log('_task_list err >>', err)
                                    reject(false);
                                })
                            })
                        }).then(err => {
                            console.log('_task_info err >>', err)
                        })
                    })
                })
        })
    },

    getSelectedProjectInfo: (object) => {
        let response = {};
        console.log('getSelectedProjectById: ', object)
        return new Promise (
            ((resolve, reject) => {
                projectModel.findOne({where: { project_id: object.project_id }})
                    .then( project => {
                        response = project.dataValues
                        delete response.createdAt
                        delete response.updatedAt
                        console.log('>>  project: ', response);
                        taskInfoModel.findOne({
                            where: {
                                projectModelId: project.dataValues.id
                            }
                        })
                            .then(_task_info => {
                                response.task_info = _task_info.dataValues
                                console.log('>> task_info: ', response.task_info)

                                taskListModel.findOne(
                                    {
                                        where: {
                                            taskInfoModelId: _task_info.dataValues.id,
                                            status: 'DONE_STATUS'
                                        }
                                    }
                                ).then( task => {

                                    osResourceModel.findOne(
                                        {
                                            attributes: {exclude: [
                                                    'id',
                                                    'createdAt',
                                                    'updatedAt'
                                                ]},
                                            where: {
                                                taskListModelId: task.dataValues.id,
                                            }
                                        }
                                    ).then( os_resource => {
                                        console.log('os_resource: ', os_resource);
                                        let _task = task.dataValues
                                        _task.os = os_resource.dataValues;
                                        console.log('_task: >> ', _task)
                                        delete _task.os.id
                                        delete _task.os.createdAt
                                        delete _task.os.updatedAt

                                        let task_list = [];
                                        task_list.push(_task);
                                        response.task_info.task_list = task_list;
                                        console.log('>> task_list: ', response.task_info.task_list)
                                        dataServerModel.findOne(
                                            {
                                                where: {
                                                    projectModelId: project.dataValues.id
                                                }
                                            }
                                        ).then( data_server => {
                                            console.log('>> data_server: ', data_server)
                                            response.data_server_info = data_server.dataValues
                                            console.log('>> data_server: ', response);
                                            resolve(response)
                                        })

                                    })
                                })
                            })
                    }).catch( err => {
                    console.log('Err', err);
                    reject(err)
                })
            })
        )
    }
}

