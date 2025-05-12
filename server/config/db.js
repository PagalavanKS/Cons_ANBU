// config/db.js
const mongoose = require('mongoose');

const connectdb = async (mongoUrl) => {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const connection = mongoose.connection;
    connection.on('connected', () => {
      console.log("MongoDB Connected");
    });

    connection.on('error', (err) => {
      console.error("DB Error:", err);
    });

  } catch (err) {
    console.error("Connection Failed:", err);
    process.exit(1);
  }
};

module.exports = connectdb;
