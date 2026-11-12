// In-Memory & File-backed User Store
// This keeps Module 1 fully functional without needing an external database setup yet.
// Later, this layer can be seamlessly swapped for PostgreSQL or MongoDB queries.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'users.data.json');

// Helper to load users from file or initialize with seed accounts
const loadUsers = () => {
  if (!fs.existsSync(DATA_FILE)) {
    // Seed initial users for all 4 roles (default password: "Password123!")
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('Password123!', salt);

    const initialUsers = [
      {
        id: 'usr_admin_01',
        name: 'Mahabubur Rahman (Admin)',
        email: 'admin@riskradar.io',
        passwordHash: defaultPasswordHash,
        role: 'Admin',
        department: 'Information Security',
        mfaEnabled: false,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_analyst_01',
        name: 'Afri Alam (Analyst)',
        email: 'analyst@riskradar.io',
        passwordHash: defaultPasswordHash,
        role: 'Analyst',
        department: 'SOC / Threat Intelligence',
        mfaEnabled: false,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_exec_01',
        name: 'Executive Leader',
        email: 'executive@riskradar.io',
        passwordHash: defaultPasswordHash,
        role: 'Executive',
        department: 'Executive Board',
        mfaEnabled: true,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_auditor_01',
        name: 'External Auditor',
        email: 'auditor@riskradar.io',
        passwordHash: defaultPasswordHash,
        role: 'Auditor',
        department: 'Compliance & Audit',
        mfaEnabled: false,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    fs.writeFileSync(DATA_FILE, JSON.stringify(initialUsers, null, 2));
    return initialUsers;
  }

  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading user data file, returning empty array:', err);
    return [];
  }
};

const saveUsers = (users) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
};

export const UserStore = {
  findAll: () => loadUsers(),

  findByEmail: (email) => {
    const users = loadUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  findById: (id) => {
    const users = loadUsers();
    return users.find((u) => u.id === id);
  },

  create: ({ name, email, passwordHash, role, department, isActive = false }) => {
    const users = loadUsers();
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'Analyst',
      department: department || 'General IT',
      mfaEnabled: true,
      isActive: Boolean(isActive),
      status: isActive ? 'active' : 'pending_approval',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    return newUser;
  },

  updatePassword: (email, newPasswordHash) => {
    const users = loadUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    user.passwordHash = newPasswordHash;
    user.updatedAt = new Date().toISOString();
    saveUsers(users);
    return user;
  },

  update: (id, updates) => {
    const users = loadUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    saveUsers(users);
    return users[index];
  },

  delete: (id) => {
    const users = loadUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    const removed = users.splice(index, 1)[0];
    saveUsers(users);
    return removed;
  },
};

