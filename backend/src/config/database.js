import { Sequelize } from 'sequelize';
import { config } from '../config/index.js';

// Initialize Sequelize instance
const isSqlite = config.database.dialect === 'sqlite';
const sequelize = isSqlite
  ? new Sequelize({
      dialect: 'sqlite',
      storage: config.database.storage,
      logging: config.database.logging,
    })
  : new Sequelize(
      config.database.name,
      config.database.username,
      config.database.password,
      {
        host: config.database.host,
        port: config.database.port,
        dialect: config.database.dialect,
        logging: config.database.logging,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );

/**
 * Test database connection
 */
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

/**
 * Initialize database and sync models
 */
export const initializeDatabase = async () => {
  try {
    // Import all models and define associations before syncing
    await import('../models/index.js');
    
    // Sync database (create tables if they don't exist)
  await sequelize.sync({ alter: config.nodeEnv === 'development' });
    console.log('✅ Database models synchronized successfully.');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

export { sequelize };