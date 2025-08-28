const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/terrasync';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

module.exports = {
  PORT,
  MONGO_URI,
  JWT_SECRET,
  CLIENT_ORIGIN,
};
