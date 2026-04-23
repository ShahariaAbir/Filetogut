import { createClient } from '@insforge/sdk';

const insforgeUrl = 'https://ij78z9ah.ap-southeast.insforge.app';
const insforgeKey = 'ik_59aeeb7aa1403d45694f006d4606068b';

const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeKey
});

async function run() {
    // try sign in
    const { data: signInData, error: signInErr } = await insforge.auth.signInWithPassword({
        email: 'raynaakter321@gmail.com',  // use a dummy or try to auth
        password: 'password123'
    });
    console.log("auth:", signInData, signInErr);
}
run();
