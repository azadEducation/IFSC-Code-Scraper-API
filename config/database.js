const { Sequelize } = require('sequelize');

// Database configurations
const dbConfigs = {
  default: {
    database: 'bank_data',
    username: 'root',
    password: '1234',
    host: 'localhost',
    dialect: 'mysql',
  },
  banks: {
    database: 'bank_data',
    username: 'root',
    password: '1234',
    host: 'localhost',
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
