import { createClient } from '@insforge/sdk';

const insforgeUrl = 'https://ij78z9ah.ap-southeast.insforge.app';
const insforgeKey = 'ik_59aeeb7aa1403d45694f006d4606068b';

const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeKey
});

async function testRpc() {
  const { data, error } = await insforge.database.rpc('get_user_from_api_key', { api_key_val: 'test' });
  console.log("RPC Data:", data);
  console.log("RPC Error:", error);
}

testRpc();
