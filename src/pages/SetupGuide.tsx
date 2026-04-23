import { Copy, Terminal } from 'lucide-react';

export default function SetupGuide() {
  const sqlScript = `-- Create files table
CREATE TABLE public.files (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  file_name text not null,
  content_type text,
  size integer,
  public_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create api_keys table for Developer APIs
CREATE TABLE public.api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  api_key text unique not null,
  title text default 'My API Key',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for files
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own files" ON public.files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own files" ON public.files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own files" ON public.files FOR DELETE USING (auth.uid() = user_id);

-- Turn on RLS for api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own api keys" ON public.api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own api keys" ON public.api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own api keys" ON public.api_keys FOR DELETE USING (auth.uid() = user_id);

-- Storage configuration (IMPORTANT: Create the 'uploads' bucket manually from the Insforge Dashboard first!)
-- 1. Go to Storage in the Insforge Dashboard
-- 2. Click "Create Bucket"
-- 3. Name it "uploads" and make sure "Public" is turned ON.
-- Note: Security policies for uploading into this bucket are managed automatically or via the Storage UI.

-- Secure RPC Database logic (Needed for API uploads using Custom API Keys)
CREATE OR REPLACE FUNCTION get_user_from_api_key(api_key_val text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  found_user_id uuid;
BEGIN
  SELECT user_id INTO found_user_id FROM public.api_keys WHERE api_key = api_key_val LIMIT 1;
  RETURN found_user_id;
END;
$$;

-- Ensure the RPC is executable by anon & authenticated
GRANT EXECUTE ON FUNCTION get_user_from_api_key(text) TO anon, authenticated;
`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Database Setup</h1>
        <p className="text-slate-500 justify mt-1 text-[13px] leading-relaxed">Run this SQL script in your SDK Dashboard to set up the tables, storage buckets, and security rules.</p>
      </div>

      <div className="bg-white text-sm border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-semibold tracking-tighter uppercase text-[11px]">
             <Terminal className="w-3.5 h-3.5 text-slate-500" /> setup.sql
          </div>
          <button 
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(sqlScript);
              } catch(e) {
                console.error("Clipboard failed");
              }
            }}
            className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition"
          >
            <Copy className="w-3 h-3" /> Copy
          </button>
        </div>
        
        <div className="p-4 bg-slate-900 overflow-x-auto text-slate-300 max-h-[400px] overflow-y-auto w-full shadow-inner">
          <pre className="font-mono text-[10px] leading-relaxed break-normal whitespace-pre">
            {sqlScript}
          </pre>
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-100 p-4 rounded text-amber-800 text-[11px]">
        <h3 className="font-bold uppercase tracking-widest mb-1 text-[10px]">What does this do?</h3>
         <ul className="mt-3 space-y-3 list-disc list-outside ml-4 leading-relaxed text-[12px]">
            <li>Creates the <b className="font-mono bg-amber-100 px-1 rounded">files</b> and <b className="font-mono bg-amber-100 px-1 rounded">api_keys</b> tables.</li>
            <li>Enables <b>Row Level Security (RLS)</b> so users can only see their own data.</li>
            <li>Manually states to create a public storage bucket named <b className="font-mono bg-amber-100 px-1 rounded">uploads</b> via the Dashboard.</li>
            <li>Adds a database function so the backend can verify your custom API Keys securely.</li>
         </ul>
      </div>
    </div>
  );
}
