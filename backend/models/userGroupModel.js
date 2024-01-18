const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const UserGroup = sequelize.define('userGroup', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    isAdmin: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

module.exports = UserGroup;