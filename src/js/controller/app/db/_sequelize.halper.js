//TODO Write all queries here
const {projectModel, pathModel, projectResultModel } = require('../../../models/config/db.initalize')

module.exports = {

// Create Project
    projectCreate: (object) => {
        projectModel.create(
            {
                project_name: object.project_name,
                project_type: object.project_type,
                project_description: object.project_description,
                project_coin: object.project_coin,
                project_price: object.project_price,
                project_status: object.project_status,
                project_end_date: object.project_end_date,
                project_end_time: object.project_end_time,

            }
        ).then(project => {
            for(let i = 0; i < object.files.length; i++) {
                let counter = object.files[i];
                console.log('Counter: ', counter);
                pathModel.create(
                    {
                        file_hash: counter.file_hash,
                        file_path: counter.file_path,
                        file_extension: counter.file_extension,
                        file_argument: counter.file_argument,
                        per_project_amount: counter.per_project_amount,
                        file_status: counter.file_status,
                        projectDefineId: project.id
                    })
            }
            }
        ).catch(error => console.log("Could not create project: "  + error))
    },

    //If we get project id resp update projectModel search by id
    ProjectId: (object) => {
        projectModel.update(
            {project_id: object.project_id},
            {where: {id: object.id}}
        ).then(data => {
            console.log("Updated new project_id: " + data);
        }).catch(error => {
            console.log("Error: " + error);
        });
    },

    //Update and Create Project tasks search by id
    ProjectResult: (object) => {
        projectModel.findOne({where: {id: object.id}})
            .then(data => {
                console.log('projectModel ID: ', data);
                for(let i = 0; i < object.tasks.length; i++) {
                    let counter = object.tasks[i];
                        console.log('Counter: ', counter);

                        projectResultModel.findOne({where: {task_id: counter.task_id}})
                            .then(update_val => {
                                // console.log('update_val: ', update_val);
                                if(update_val !== null){
                                    console.log('>>> Updated: ', i);
                                    projectResultModel.update(counter, {where: {task_id: counter.task_id}})
                                }else {
                                    console.log('>>> Created: ', i);
                                    projectResultModel.create(
                                    {
                                        task_id: counter.task_id,
                                        task_hash: counter.task_hash,
                                        provider_wallet_address: counter.provider_wallet_address,
                                        file_status: counter.file_status,
                                        projectDefineId: data.id
                                    })
                                }
                            });

                }
        })

    },








// Example here
//Account
    nodeCreate: (node_uid) => {
        accountModel.create(
            {
                node_uid: node_uid
            }
            ).then(account => {
                console.log("Node generated: ", account.id);
            }).catch(error => {
                console.log("Could not create account. Please try again! " + error);
        });
    },

    findAllAccounts: () => {
        accountModel.findAll().then(data => {
            console.log("All users: ", JSON.stringify(data, null, 4));
        });
    },

    findOneWalletByID: (id) => {
        accountModel.findByPk(id)
            .then(data => {
                console.log("Find One Wallet " + data.active_wallet);
            }).catch(error => {
                console.log("There no wallet Address " + error);
        });
    },

    findOneWalletByElement: (data) => {
        accountModel.findOne({where: {node_uid: data}})
            .then(data => {
                console.log("Data by Element: "+ data.active_wallet);
            }).catch(error => {
                console.log("Error: " + error);
        });
    },

    updateWalletByElement: (node_uid, new_wallet_address) => {
        accountModel.update (
            {active_wallet: new_wallet_address},
            {where: {node_uid: node_uid}}
            ).then(data => {
                console.log("Updated new wallet: " + data);
            }).catch(error => {
            console.log("Error: " + error);
        });
    },

// Wallet
    createWallet: (node_uid, wallet_address, wallet_privateKey, password) => {
        accountModel.findOne({where: {node_uid: node_uid}})
        .then(data => walletModel.create({
            wallet_address: wallet_address,
            wallet_privateKey: wallet_privateKey,
            password: password,
            accountId: data.id,
        })).catch(error => console.log("Could not create wallet: "  + error))
    },

    findAllWallets: () => {
        walletModel.findAll().then(data => {
            console.log("All wallets: ", JSON.stringify(data, null, 4));
        });
    },

};
