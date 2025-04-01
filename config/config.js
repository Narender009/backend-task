require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,

  // Automatically select local or cloud MongoDB URI based on NODE_ENV
  MONGO_URI:
    process.env.NODE_ENV === 'production'
      ? process.env.MONGO_URI_CLOUD
      : process.env.MONGO_URI_LOCAL,

  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d'
};
