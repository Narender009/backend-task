const mongoose = require('mongoose');
const { MONGO_URI } = require('./config');

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${MONGO_URI.includes('localhost') ? 'Local' : 'Cloud'}`);
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
