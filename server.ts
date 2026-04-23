import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@insforge/sdk';
import path from 'path';

// Using the provided Insforge credentials
const insforgeUrl = 'https://ij78z9ah.ap-southeast.insforge.app';
const insforgeKey = 'ik_59aeeb7aa1403d45694f006d4606068b'; // Used as anonKey

const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeKey
});

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
      }

      const apiKey = authHeader.split(' ')[1];
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Instead of an RPC function (which may be different in Insforge), let's just query the api_keys table directly
      // Note: for this to work with anonKey, RLS must allow reading it, or API key usage must not require RLS.
      // But we mapped API key previously.
      const { data: keys, error: keyError } = await insforge.database
        .from('api_keys')
        .select('user_id')
        .eq('api_key', apiKey);

      if (keyError || !keys || keys.length === 0) {
        return res.status(401).json({ error: 'Invalid API Key' });
      }

      const userId = keys[0].user_id;

      const file = req.file;
      const fileName = `${userId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      // Upload to Storage
      // Convert buffer to Blob for Insforge SDK
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

  // Vite middle-ware setup for development / production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
