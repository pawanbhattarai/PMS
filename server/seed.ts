
import bcrypt from 'bcryptjs';
import { storage } from './storage-new';

async function seedUsers() {
  try {
    // Check if users already exist
    const existingAdmin = await storage.getUserByEmail('admin@hotelchain.com');
    if (existingAdmin) {
      console.log('Demo users already exist');
      return;
    }

    // Create demo branch first
    const branch = await storage.createBranch({
      name: 'Downtown Hotel',
      address: '123 Main St',
      phone: '+1234567890',
      email: 'downtown@hotelchain.com'
    });

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const branchPassword = await bcrypt.hash('branch123', 10);
    const receptionPassword = await bcrypt.hash('reception123', 10);

    // Create demo users
    await storage.createUser({
      email: 'admin@hotelchain.com',
      password: adminPassword,
      name: 'Super Admin',
      role: 'super_admin',
      branchId: branch.id,
      active: true
    });

    await storage.createUser({
      email: 'downtown@hotelchain.com',
      password: branchPassword,
      name: 'Branch Admin',
      role: 'branch_admin',
      branchId: branch.id,
      active: true
    });

    await storage.createUser({
      email: 'reception@hotelchain.com',
      password: receptionPassword,
      name: 'Reception Staff',
      role: 'receptionist',
      branchId: branch.id,
      active: true
    });

    console.log('Demo users created successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

export { seedUsers };
