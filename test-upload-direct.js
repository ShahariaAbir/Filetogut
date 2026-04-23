import { createClient } from '@insforge/sdk';
import fs from 'fs';

const insforge = createClient({
  baseUrl: 'https://ij78z9ah.ap-southeast.insforge.app',
  anonKey: 'ik_59aeeb7aa1403d45694f006d4606068b'
});

async function run() {
    const textBuffer = Buffer.from("hello text");
    const blob = new Blob([textBuffer], { type: 'text/plain' });
    const { data: uploadData, error: uploadError } = await insforge.storage
    .from('uploads')
    .upload("test-upload-" + Date.now() + ".txt", blob);

    console.log("Upload result:", { uploadData, uploadError });
}

run();
