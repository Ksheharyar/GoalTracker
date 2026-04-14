const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });

const User = require('../src/models/User');
const Goal = require('../src/models/Goal');
const Session = require('../src/models/Session');

async function resetCredentials() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/keepon-dev';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    console.log('Deleting all users...');
    const userResult = await User.deleteMany({});
    console.log(`✓ Deleted ${userResult.deletedCount} user(s)`);

    console.log('Deleting all goals...');
    const goalResult = await Goal.deleteMany({});
    console.log(`✓ Deleted ${goalResult.deletedCount} goal(s)`);

    console.log('Deleting all sessions...');
    const sessionResult = await Session.deleteMany({});
    console.log(`✓ Deleted ${sessionResult.deletedCount} session(s)`);

    console.log('\n✓ All credentials and data reset successfully!');
    console.log('You can now create fresh user accounts.');

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error resetting credentials:', error.message);
    process.exit(1);
  }
}

resetCredentials();
