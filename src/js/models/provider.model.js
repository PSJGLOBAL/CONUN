module.exports = {
    projectListSchema: (sequelize, Sequelize) => {
        return sequelize.define('provider_project_list_model', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            project_status: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            project_sequence: {
                type: Sequelize.INTEGER,
            },
            project_name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            project_id: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            project_description: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            requester_uid: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            resource_type: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            pay_type: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            credit: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            start_date: Sequelize.DATE,
            end_date: Sequelize.DATE,
            total_tasks: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            completed_tasks: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            task_created_date: {
                type: Sequelize.DATE
            }
        })
    }
}