const { MongoClient } = require('mongodb');

async function updateServices() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('drone-app');
    
    // Update services without category to default 'service' category
    const result = await db.collection('services').updateMany(
      { category: { $exists: false } },
      { $set: { category: 'service' } }
    );
    
    console.log(`Updated ${result.modifiedCount} services to default category 'service'`);
  } catch (error) {
    console.error('Error updating services:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

updateServices(); 