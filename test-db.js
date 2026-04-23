import { createClient } from '@insforge/sdk';

const insforgeUrl = 'https://ij78z9ah.ap-southeast.insforge.app';
const insforgeKey = 'ik_59aeeb7aa1403d45694f006d4606068b';

const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeKey
});

async function testDatabase() {
  console.log('Insforge db keys:', Object.keys(insforge.database));
  
  if (typeof insforge.database.from === 'function') {
    console.log('from() exists.');
    const q = insforge.database.from('api_keys');
    console.log('from() returns:', Object.keys(q));
    
    // Check if delete and insert methods have eq, etc.
    if (typeof q.delete === 'function') {
      const d = q.delete();
      console.log('delete() returns:', Object.keys(d));
    }
  } else {
    console.log('from() does not exist?');
  }
}
testDatabase();
