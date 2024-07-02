const { DataTypes, literal } = require('sequelize');
const sequelize = require('../config/database');

const bank_ifsc_codes = sequelize.banks.define('bank_ifsc_codes', {
    ifsc_code: {
        type: DataTypes.STRING(250),
        primaryKey: true
    },
    bank_code: {
        type: DataTypes.STRING(11),
    },
    bank: {
        type: DataTypes.STRING(100),
        defaultValue: null,
        allowNull: true,
    },
    branch: {
        type: DataTypes.STRING(100),
        defaultValue: null,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        defaultValue: null,
        allowNull: true,
    },
    district: {
        type: DataTypes.STRING(50),
        defaultValue: null,
        allowNull: true,
    },
    state: {
        type: DataTypes.STRING(50),
        defaultValue: null,
        allowNull: true,
    },
    std_code: {
        type: DataTypes.STRING(50),
        defaultValue: null,
        allowNull: true,
    },
    contact: {
        type: DataTypes.STRING(150),
        defaultValue: null,
        allowNull: true,
    },
    micr: {
        type: DataTypes.STRING(150),
        defaultValue: null,
        allowNull: true,
    },
    center: {
        type: DataTypes.STRING(150),
        defaultValue: null,
        allowNull: true,
    }
}, {
    tableName: 'bank_ifsc_codes',
    timestamps: false,
});

module.exports = bank_ifsc_codes;

