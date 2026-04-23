import fs from 'fs';
import path from 'path';

async function testUpload() {
    const formData = new FormData();
    const blob = new Blob(['hello world'], { type: 'text/plain' });
    formData.append('file', blob, 'test.txt');

    try {
        const response = await fetch('http://127.0.0.1:3000/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer sk_2069fa4d4ab2497ebffed4d6a624a0d9` // need to generate a real api key
            },
            body: formData as any
        });
        const data = await response.json();
        console.log("Upload test:", response.status, data);
    } catch (e) {
        console.error(e);
    }
}
testUpload();
