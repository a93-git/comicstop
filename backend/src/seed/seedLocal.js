import { initializeDatabase } from '../config/database.js';
import { User } from '../models/index.js';

async function seed() {
  try {
    await initializeDatabase();

    const users = [
      { username: 'alice', email: 'alice@example.com', password: 'Password1!', firstName: 'Alice', lastName: 'Wonder', isCreator: true, isEmailVerified: true },
      { username: 'bob', email: 'bob@example.com', password: 'Password1!', firstName: 'Bob', lastName: 'Builder', isCreator: false, isEmailVerified: true },
      { username: 'carol', email: 'carol@example.com', password: 'Password1!', firstName: 'Carol', lastName: 'Singer', isCreator: true, isEmailVerified: false },
    ];

    for (const u of users) {
      const [user, created] = await User.findOrCreate({
        where: { email: u.email },
        defaults: u,
      });
      console.log(created ? `Created user ${user.email}` : `Exists user ${user.email}`);
    }

    console.log('✅ Seed complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed', error);
    process.exit(1);
  }
}

seed();
