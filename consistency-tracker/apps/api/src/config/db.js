const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { mongoUri, nodeEnv } = require('./env');

let memoryServer = null;

async function connectDb() {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
  } catch (error) {
    if (nodeEnv === 'production') {
      throw error;
    }

    console.warn('Primary MongoDB connection failed, starting an in-memory database for local development...');

    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'keepon-dev',
        },
      });
    }

    await mongoose.connect(memoryServer.getUri(), {
      serverSelectionTimeoutMS: 10000,
    });
  }
}

module.exports = {
  connectDb,
};