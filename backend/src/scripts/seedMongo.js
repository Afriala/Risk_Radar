// MongoDB Atlas Initial Data Seeder & Migration Script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { UserModel } from '../models/mongodb/user.schema.js';
import { AssetModel } from '../models/mongodb/asset.schema.js';
import { RiskModel } from '../models/mongodb/risk.schema.js';
import { AuditModel } from '../models/mongodb/audit.schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const uri = process.env.MONGODB_URI;

async function seedData() {
  if (!uri) {
    console.error('MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas:', mongoose.connection.name);

    const modelsDir = path.join(__dirname, '../models');

    // 1. Seed Users
    const usersFile = path.join(modelsDir, 'users.data.json');
    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      for (const u of users) {
        await UserModel.findOneAndUpdate({ email: u.email.toLowerCase() }, u, { upsert: true, new: true });
      }
      console.log(`✓ Seeded ${users.length} Users into MongoDB.`);
    }

    // 2. Seed Assets
    const assetsFile = path.join(modelsDir, 'assets.data.json');
    if (fs.existsSync(assetsFile)) {
      const assets = JSON.parse(fs.readFileSync(assetsFile, 'utf8'));
      for (const a of assets) {
        await AssetModel.findOneAndUpdate({ id: a.id }, a, { upsert: true, new: true });
      }
      console.log(`✓ Seeded ${assets.length} Assets into MongoDB.`);
    }

    // 3. Seed Risks
    const risksFile = path.join(modelsDir, 'risks.data.json');
    if (fs.existsSync(risksFile)) {
      const risks = JSON.parse(fs.readFileSync(risksFile, 'utf8'));
      for (const r of risks) {
        await RiskModel.findOneAndUpdate({ id: r.id }, r, { upsert: true, new: true });
      }
      console.log(`✓ Seeded ${risks.length} Risks into MongoDB.`);
    }

    // 4. Seed Audit Logs (first 100)
    const auditFile = path.join(modelsDir, 'audit.data.json');
    if (fs.existsSync(auditFile)) {
      const audits = JSON.parse(fs.readFileSync(auditFile, 'utf8')).slice(0, 100);
      for (const aud of audits) {
        await AuditModel.findOneAndUpdate({ id: aud.id }, aud, { upsert: true, new: true });
      }
      console.log(`✓ Seeded ${audits.length} Audit Logs into MongoDB.`);
    }

    console.log('\n🎉 ALL COLLECTIONS SUCCESSFULLY MIGRATED TO MONGODB ATLAS!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

seedData();

