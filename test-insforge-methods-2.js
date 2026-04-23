import { createClient } from '@insforge/sdk';

const insforgeUrl = 'https://ij78z9ah.ap-southeast.insforge.app';
const insforgeKey = 'ik_59aeeb7aa1403d45694f006d4606068b';

const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeKey
});

console.log("verifyOtp:", typeof insforge.auth.verifyOtp);
console.log("rpc:", typeof insforge.database.rpc);
