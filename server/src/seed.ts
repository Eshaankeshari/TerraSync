import dotenv from 'dotenv';
dotenv.config();
import { connect, Types } from 'mongoose';
import User from './models/User.js';
import Report from './models/Report.js';
import bcrypt from 'bcryptjs';

async function run() {
  await connect(process.env.MONGODB_URI!);

  await User.deleteMany({});
  await Report.deleteMany({});

  const citizenPass = await bcrypt.hash('password123', 10);
  const municipalPass = await bcrypt.hash('admin123', 10);

  const citizen = await User.create({ name: 'Asha', email: 'asha@example.com', passwordHash: citizenPass, role: 'citizen' });
  const municipal = await User.create({ name: 'BBMP Admin', email: 'admin@city.gov', passwordHash: municipalPass, role: 'municipal' });

  const base: [number, number] = [77.5946, 12.9716];

  const r1 = await Report.create({
    citizen: new Types.ObjectId(citizen.id),
    description: 'Overflowing garbage bin near park gate',
    photoUrl: 'https://via.placeholder.com/800x500?text=Before+Photo',
    location: { type: 'Point', coordinates: base, address: 'MG Road, Bengaluru' },
    status: 'Submitted',
    concernCount: 2,
    confirmedBy: [citizen._id]
  });

  const r2 = await Report.create({
    citizen: new Types.ObjectId(citizen.id),
    description: 'Illegal dumping behind market',
    photoUrl: 'https://via.placeholder.com/800x500?text=Before+Photo',
    location: { type: 'Point', coordinates: [77.6, 12.97], address: 'Residency Road, Bengaluru' },
    status: 'In Progress',
    concernCount: 1,
    confirmedBy: [citizen._id]
  });

  console.log('Seeded users and reports:', { citizen: citizen.email, municipal: municipal.email, reports: [r1.id, r2.id] });
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });