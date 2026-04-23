import { createClient } from '@insforge/sdk';

const insforgeUrl = 'https://ij78z9ah.ap-southeast.insforge.app';
const insforgeKey = 'ik_59aeeb7aa1403d45694f006d4606068b';

const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeKey
});

async function testDatabase() {
  const q = insforge.database.from('api_keys');
  const d = q.delete();
  console.log('delete prototype keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(d)));
}
testDatabase();
