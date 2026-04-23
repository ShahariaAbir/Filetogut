import { createClient } from '@insforge/sdk';

const insforgeUrl = 'https://ij78z9ah.ap-southeast.insforge.app';
const insforgeKey = 'ik_59aeeb7aa1403d45694f006d4606068b';

const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeKey
});

async function testInsert() {
  const { data, error } = await insforge.database.from('api_keys').insert([{ user_id: '00000000-0000-0000-0000-000000000000', api_key: 'test', title: 'test' }]);
  console.log("Insert result:", { data, error });
}
testInsert();
