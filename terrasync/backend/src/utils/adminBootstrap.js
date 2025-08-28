const User = require('../models/User');

async function ensureAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@terrasync.local';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin1234';
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const user = new User({ name: 'Admin', email: adminEmail, role: 'admin', passwordHash: 'temp' });
    await user.setPassword(adminPass);
    await user.save();
    // eslint-disable-next-line no-console
    console.log(`Created admin user ${adminEmail} / ${adminPass}`);
  }
}

module.exports = { ensureAdmin };
