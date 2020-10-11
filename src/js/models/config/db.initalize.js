const { Sequelize } = require('sequelize');
const { config } = require('../../../../private/config/project.settings');
const { nodeSchema } = require('../node.model');
const { projectSchema, dataServerSchema } = require('../requester.model')
const { taskInfoSchema, taskListSchema, osResourceSchema } = require('../task.model');
// const { projectListSchema } = require('../provider.model');
const { settingsSchema } = require('../app.model');
const log = require('electron-log');
const electron = require('electron');
const { app } = electron;
const path = require('path');
const dbPath = path.join(app.getPath('userData'), 'manager.sqlite');
log.info('dbPath: ', dbPath);

let sequelize = new Sequelize({
    dialect: config().database.type,
    storage: dbPath,
});



// App Model
const nodeModel = nodeSchema(sequelize, Sequelize);
const settingsModel = settingsSchema(sequelize, Sequelize);

// Requester Model
const projectModel = projectSchema(sequelize, Sequelize);
const dataServerModel = dataServerSchema(sequelize, Sequelize);
const taskInfoModel = taskInfoSchema(sequelize, Sequelize);
const taskListModel = taskListSchema(sequelize, Sequelize);
const osResourceModel = osResourceSchema(sequelize, Sequelize);

// Provider Model
// const projectListModel = projectListSchema(sequelize, Sequelize);

sequelize.sync({ force: false })
.then(() => {
    try {
        console.log(`Database started`)
    } catch (e) {
        console.log(`Database error` + e)
    }
});


taskInfoModel.belongsTo(projectModel);
taskListModel.belongsTo(taskInfoModel);
osResourceModel.belongsTo(taskListModel);
dataServerModel.belongsTo(projectModel);


module.exports = {
    nodeModel,
    projectModel,
    taskInfoModel,
    taskListModel,
    osResourceModel,
    dataServerModel,
    settingsModel,
    // projectListModel
};