const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const clearDB = async () => {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gram-suvidha';
    console.log(`Connecting to MongoDB to clear database at: ${dbUri.replace(/:[^@]+@/, ':****@')}`);
    
    await mongoose.connect(dbUri);
    console.log('MongoDB Connected.');

    // Drop the entire database
    await mongoose.connection.db.dropDatabase();
    console.log('Successfully cleared entire database (dropped database).');

    await mongoose.connection.close();
    console.log('Database connection closed safely.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error.message);
    process.exit(1);
  }
};

clearDB();
