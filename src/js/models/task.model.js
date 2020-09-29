module.exports = {
    taskInfoSchema: (sequelize, Sequelize) => {
        return sequelize.define('task_info_model', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            task_id: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            task_process_count: {
                type: Sequelize.INTEGER,
            },
            task_process_mode: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            task_result_mode: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            task_created_date: {
                type: Sequelize.DATE
            }
        })
    },

    taskListSchema: (sequelize, Sequelize) => {
        return sequelize.define('task_list_model', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            task_sub_id: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            provider_uid: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: false
            },
            value: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            process_name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
        })
    },


    osResourceSchema: (sequelize, Sequelize) => {
        return sequelize.define('os_resource_model', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            task_resource: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            process_loca: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            process_crc: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            }
        })
    },
};