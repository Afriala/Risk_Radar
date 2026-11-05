// User Entity / Model Structure (Database Agnostic)
// Defines the shape of user records for Module 1

export const UserSchema = {
  id: 'String (UUID / Auto-increment)',
  name: 'String (Full Name)',
  email: 'String (Unique, Validated)',
  passwordHash: 'String (Bcrypt encrypted)',
  role: 'Enum (Admin, Analyst, Executive, Auditor)',
  department: 'String (e.g. IT, Security, Finance, Operations)',
  mfaEnabled: 'Boolean (Default: false)',
  isActive: 'Boolean (Default: true)',
  createdAt: 'Date',
  updatedAt: 'Date'
};

