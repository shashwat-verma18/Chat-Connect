const Sequelize = require('sequelize');

const sequelize = new Sequelize('group-chat', 'root', 'Shashwat@123', {dialect: 'mysql', host:'localhost'});

module.exports = sequelize;