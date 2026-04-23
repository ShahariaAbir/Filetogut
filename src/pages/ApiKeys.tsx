import { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';
import { Key, Copy, Plus, Trash2, Loader2, Eye, EyeOff, AlertTriangle, X } from 'lucide-react';
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
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyTitle, setNewKeyTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    const { data: { user } } = await insforge.auth.getCurrentUser();
    if (!user) {
      setLoading(false);
      return; 
    }
  
    const { data, error } = await insforge.database
      .from('api_keys')
      .select('*');
      
    if (!error && data) {
      setKeys((data as ApiKey[]).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }
    setLoading(false);
  };

  const generateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyTitle.trim()) return;

    setGenerating(true);
    try {
      const { data: { user } } = await insforge.auth.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const originalKey = 'sk_' + uuidv4().replace(/-/g, '');
      
      const { error } = await insforge.database.from('api_keys').insert([{
        user_id: user.id,
        title: newKeyTitle.trim(),
        api_key: originalKey,
      }]).select();

      if (error) throw error;
      await fetchKeys();
      setIsCreateModalOpen(false);
      setNewKeyTitle('');
    } catch (error: any) {
      console.error(`Failed to generate key: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const deleteKey = async () => {
    if (!deleteConfirmId) return;
    
    try {
      const { error } = await insforge.database.from('api_keys').delete().eq('id', deleteConfirmId).select();
      if (error) console.error(`Delete failed: ${error.message}`);
      else await fetchKeys();
    } catch(err: any) {
      console.error(`Delete error: ${err.message}`);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Optional: add a small local toast here if you like
    } catch (e) {
      console.error('Clipboard failed');
    }
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-start justify-between flex-col gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
          <p className="text-slate-500 text-sm mt-1">Manage integration keys to upload files programmatically.</p>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center w-full sm:w-auto gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 text-sm font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Generate New Key
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-3 rounded text-amber-800 text-[11px] leading-relaxed">
        <strong>Security Warning:</strong> Your API keys carry full upload privileges to your account. Do not share them publicly or commit them to source control. If a key is compromised, delete it immediately.
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : keys.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center border-dashed border-2 bg-slate-50">
          <Key className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No API keys generated</h3>
          <p className="text-slate-500 text-sm">Create your first key to start uploading files via the API.</p>
        </div>
      ) : (
        <div className="space-y-4">
            {keys.map((key) => {
              const isVisible = visibleKeys[key.id];
              return (
                <div key={key.id} className="bg-indigo-900 text-white rounded-xl p-5 shadow-sm border border-indigo-800">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-base font-semibold text-white break-words pr-2">{key.title}</h3>
                    <button onClick={() => setDeleteConfirmId(key.id)} className="text-indigo-300 hover:text-red-400 transition-colors bg-indigo-800/50 hover:bg-indigo-900 p-1.5 rounded-md mt-[-4px] mr-[-4px]" title="Revoke Key">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-indigo-300 text-xs mb-4">Created {new Date(key.created_at).toLocaleDateString()}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1 block">Private API Key</label>
                      <div className="bg-indigo-950 rounded p-2.5 flex justify-between items-center border border-indigo-800/50 flex-wrap gap-2">
                        <input 
                          type={isVisible ? "text" : "password"} 
                          value={key.api_key} 
                          readOnly 
                          className="font-mono text-xs overflow-hidden text-ellipsis bg-transparent border-none outline-none text-indigo-300 w-full mb-1"
                        />
                        <div className="flex gap-2 w-full justify-end border-t border-indigo-900/50 pt-2 mt-1">
                          <button onClick={() => toggleVisibility(key.id)} className="text-indigo-400 hover:text-white transition flex items-center gap-1.5 text-xs bg-indigo-900 px-2 py-1 rounded">
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            {isVisible ? 'Hide' : 'Reveal'}
                          </button>
                          <button onClick={() => copyToClipboard(key.api_key)} className="text-indigo-400 hover:text-white transition flex items-center gap-1.5 text-xs bg-indigo-900 px-2 py-1 rounded">
                            <Copy className="w-3.5 h-3.5" />
                            Copy
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

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Create new API Key</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={generateKey} className="p-5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-tighter mb-2">Key Name</label>
              <input
                type="text"
                autoFocus
                required
                placeholder="e.g., Production Server"
                value={newKeyTitle}
                onChange={(e) => setNewKeyTitle(e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-200 rounded-md py-2.5 px-3 border bg-slate-50 mb-6"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-slate-200 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating || !newKeyTitle.trim()}
                  className="flex-1 flex justify-center py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Revoke API Key?</h3>
                <p className="text-slate-500 text-sm mb-6">Revoking this key will instantly break any applications using it. This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 py-2.5 px-4 border border-slate-200 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteKey}
                    className="flex-1 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Yes, Revoke
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
