import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Key, Copy, Plus, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ApiKey {
  id: string;
  title: string;
  api_key: string;
  created_at: string;
}

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setKeys(data);
    }
    setLoading(false);
  };

  const generateKey = async () => {
    const title = prompt('Enter a name for this API Key (e.g., "Production Sever"):');
    if (!title) return;

    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const originalKey = 'sk_' + uuidv4().replace(/-/g, '');
      
      const { error } = await supabase.from('api_keys').insert({
        user_id: user.id,
        title: title,
        api_key: originalKey,
      });

      if (error) throw error;
      fetchKeys();
    } catch (error: any) {
      alert(`Failed to generate key: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const deleteKey = async (id: string) => {
    if (!confirm('Revoking this key will instantly break any applications using it. Are you sure?')) return;
    
    const { error } = await supabase.from('api_keys').delete().eq('id', id);
    if (error) alert(`Delete failed: ${error.message}`);
    else fetchKeys();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('API Key copied to clipboard!');
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
          <p className="text-slate-500 text-sm mt-1">Manage integration keys to upload files programmatically.</p>
        </div>
        
        <button
          onClick={generateKey}
          disabled={generating}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 text-sm font-medium shadow-sm"
        >
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          Generate New Key
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-3 rounded text-amber-800 text-[11px]">
        <strong>Security Warning:</strong> Your API keys carry full upload privileges to your account. Do not share them publicly or commit them to source control. If a key is compromised, delete it immediately.
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : keys.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center border-dashed border-2 bg-slate-50">
          <Key className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No API keys generated</h3>
          <p className="text-slate-500 text-sm">Create your first key to start uploading files via the API.</p>
        </div>
      ) : (
        <div className="space-y-4">
            {keys.map((key) => {
              const isVisible = visibleKeys[key.id];
              return (
                <div key={key.id} className="bg-indigo-900 text-white rounded-xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{key.title}</h3>
                    <button onClick={() => deleteKey(key.id)} className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium">Revoke Key</button>
                  </div>
                  <p className="text-indigo-200 text-xs mb-4">Created on {new Date(key.created_at).toLocaleDateString()}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold mb-1 block">Private API Key</label>
                      <div className="bg-indigo-950 rounded p-3 flex justify-between items-center border border-indigo-700/50">
                        <input 
                          type={isVisible ? "text" : "password"} 
                          value={key.api_key} 
                          readOnly 
                          className="font-mono text-xs overflow-hidden text-ellipsis mr-2 bg-transparent border-none outline-none text-indigo-400 w-full"
                        />
                        <div className="flex gap-3 ml-2 flex-shrink-0">
                          <button onClick={() => toggleVisibility(key.id)} className="text-indigo-400 hover:text-white transition">
                            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button onClick={() => copyToClipboard(key.api_key)} className="text-indigo-400 hover:text-white transition uppercase text-[10px] tracking-wider font-bold">
                            COPY
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
