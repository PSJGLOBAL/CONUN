module.exports = {
    nodeSchema: (sequelize, Sequelize) => {
        return sequelize.define('node_model', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            wallet_address: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            wallet_private_key: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING,
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
        })
    }
}