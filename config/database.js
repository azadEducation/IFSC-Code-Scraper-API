const { Sequelize } = require('sequelize');

// Database configurations
const dbConfigs = {
  default: {
    database: 'mysip_transactions',
    username: 'root',
    password: 'wooden@123',
    host: '10.4.1.9',
    dialect: 'mysql',
  },
  website_live: {
    database: 'mysip_web',
    username: 'root',
    password: 'wooden@123',
    host: '10.4.1.9',
    dialect: 'mysql',
  },
  kra_transaction: {
    database: 'mysip_transactions',
    username: 'root',
    password: 'wooden@123',
    host: '10.4.1.9',
    dialect: 'mysql',
  },
  website: {
    database: 'mysip_web',
    username: 'root',
    password: 'wooden@123',
    host: '10.4.1.9',
    dialect: 'mysql',
  },
  mysip_nav: {
    database: 'mysip_nav',
    username: 'root',
    password: 'wooden@123',
    host: '10.4.1.9',
    dialect: 'mysql',
  },
  mysip_crm: {
    database: 'mysip_crm',
    username: 'root',
    password: 'wooden@123',
    host: '10.4.1.9',
    dialect: 'mysql',
  },

  // Add more database configurations as needed
};

// Create an object to store the Sequelize instances
const sequelizeInstances = {};

// Loop through the database configurations and create Sequelize instances
Object.entries(dbConfigs).forEach(([name, dbConfig]) => {
  const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      dialect: dbConfig.dialect,
      logging: false,
      // Add additional Sequelize options here, if needed
    }
  );

  // Store the Sequelize instance using the specified name
  sequelizeInstances[name] = sequelize;
});

// Export the sequelizeInstances object
module.exports = sequelizeInstances;
