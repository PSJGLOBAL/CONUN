module.exports = {
    settingsSchema: (sequelize, Sequelize) => {
        return sequelize.define('app_settings_model', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            current_language: {
                type: Sequelize.STRING,

            },
            resource_control: {
                type: Sequelize.STRING,

            },
            user_mode: {
                type: Sequelize.STRING,

            },
            path: {
                type: Sequelize.STRING,

            },
            is_active: {
                type: Sequelize.BOOLEAN,
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
        })
    }
}