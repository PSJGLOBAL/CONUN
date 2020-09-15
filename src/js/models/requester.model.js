module.exports = {
    projectSchema: (sequelize, Sequelize) => {
        return sequelize.define('project_model', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            project_status: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            project_sequence: {
                type: Sequelize.INTEGER,
            },
            requester_uid: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            project_name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            project_id: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            project_description: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            start_date: {
                type: Sequelize.DATE
            },
            end_date: {
                type: Sequelize.DATE
            },
            pay_type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            credit: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            resource_type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            total_tasks: {
                type: Sequelize.INTEGER,
            },
            completed_tasks: {
                type: Sequelize.INTEGER,
            },
            task_model: {
                type: Sequelize.INTEGER,
            }
        })
    },

    dataServerSchema: (sequelize, Sequelize) => {
        return sequelize.define('data_server_model', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: false
            },
            ip: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            port: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            account: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        })
    }
};