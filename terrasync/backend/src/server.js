require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const app = require('./app');
const { PORT, MONGO_URI } = require('./config/env');
const { connect } = require('./utils/db');
const { ensureAdmin } = require('./utils/adminBootstrap');

async function ensureUploadsDir() {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

async function connectToDatabase() {
  await connect();
  const Report = require('./models/Report');
  await Report.init();
}

async function start() {
  try {
    await ensureUploadsDir();
    await connectToDatabase();
    await ensureAdmin();

    const server = http.createServer(app);
    server.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`TerraSync backend listening on port ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
