import { MongoClient } from 'mongodb';

async function updateUserToAdmin() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('test');
    const users = db.collection('users');
    
    const result = await users.updateOne(
      { email: 'admin@ecofisio.com' },
      { $set: { role: 'admin' } }
    );
    
    console.log('Usuario actualizado a administrador:', result.modifiedCount);
    
    // Verificar la actualización
    const user = await users.findOne({ email: 'admin@ecofisio.com' });
    console.log('Usuario después de la actualización:', user);
    
  } finally {
    await client.close();
  }
}

updateUserToAdmin().catch(console.error);