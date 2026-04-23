import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Using the provided Insforge credentials
const supabaseUrl = 'https://ij78z9ah.ap-southeast.insforge.app';
const supabaseKey = 'ik_59aeeb7aa1403d45694f006d4606068b'; // Assuming this has service-role or admin privileges for bypassing RLS during API key-based uploads.

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },    
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

      // Validate API Key and fetch User ID via our secure RPC function
      const { data: userId, error: rpcError } = await supabase.rpc('get_user_from_api_key', {
        api_key_val: apiKey
      });

      if (rpcError || !userId) {
        return res.status(401).json({ error: 'Invalid API Key' });
      }

      const file = req.file;
      const fileName = `${userId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get Universal Public URL
      const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
      const publicUrl = publicUrlData.publicUrl;

      // Register file in the database
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          user_id: userId,
          file_name: file.originalname,
          content_type: file.mimetype,
          size: file.size,
          public_url: publicUrl
        });

      if (dbError) {
        console.error('File logging to db error:', dbError);
        // Do not fail the request if DB logging fails, just warn
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
