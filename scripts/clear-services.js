// scripts/clear-services.js

const { MongoClient } = require('mongodb');

async function clearServices() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('drone-app');
    
    const result = await db.collection('services').deleteMany({});
    
    console.log(`Deleted ${result.deletedCount} services from the database`);
  } catch (error) {
    console.error('Error clearing services:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

clearServices(); 