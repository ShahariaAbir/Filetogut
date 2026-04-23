import express from 'express';
import multer from 'multer';
import { createClient } from '@insforge/sdk';

export const apiRouter = express.Router();

const insforgeUrl = 'https://ij78z9ah.ap-southeast.insforge.app';
const insforgeKey = 'ik_59aeeb7aa1403d45694f006d4606068b'; // Used as anonKey

const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeKey
});

const upload = multer({ storage: multer.memoryStorage() });

apiRouter.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const apiKey = authHeader.split(' ')[1];
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check API key securely bypassing RLS through the rpc function we created
    const { data: userId, error: rpcError } = await insforge.database.rpc('get_user_from_api_key', { api_key_val: apiKey });

    if (rpcError || !userId) {
      return res.status(401).json({ error: 'Invalid API Key' });
    }

    const file = req.file;
    const fileName = `${userId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Upload to Storage
    const blob = new Blob([file.buffer], { type: file.mimetype });
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from('uploads')
      .upload(fileName, blob);

    if (uploadError || !uploadData) {
      throw uploadError || new Error("Failed to upload file to Insforge");
    }

    const publicUrl = uploadData.url;

    // Register file in the database
    const { error: dbError } = await insforge.database
      .from('files')
      .insert([{
        user_id: userId,
        file_name: file.originalname,
        content_type: file.mimetype,
        size: file.size,
        public_url: publicUrl
      }]);

    if (dbError) {
      console.error('File logging to db error:', dbError);
    }

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: publicUrl,
      file: {
        name: file.originalname,
        size: file.size,
        type: file.mimetype
      }
    });
  } catch (err: any) {
    console.error('Upload Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});
