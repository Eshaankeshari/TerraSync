const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MONGO_URI } = require('../config/env');

let memoryServer = null;

async function connect() {
  mongoose.set('strictQuery', true);
  if (process.env.USE_INMEMORY_DB === 'true' || MONGO_URI === 'memory') {
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri('terrasync');
    await mongoose.connect(uri);
  } else {
    await mongoose.connect(MONGO_URI, { dbName: 'terrasync' });
  }
}

async function disconnect() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = { connect, disconnect };
