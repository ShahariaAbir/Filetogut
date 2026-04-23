import React, { useState, useEffect, useRef } from 'react';
import { insforge } from '../lib/insforge';
import { Upload, Copy, Trash2, File, Link as LinkIcon, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileData {
  id: string;
  file_name: string;
  public_url: string;
  size: number;
  content_type: string;
  created_at: string;
}

export default function Files() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modals state
  const [deleteConfirmFileId, setDeleteConfirmFileId] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const { data, error } = await insforge.database
      .from('files')
      .select('*')
      
    if (!error && data) {
      setFiles((data as FileData[]).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }
    setLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await insforge.auth.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${user.id}/${Date.now()}-${safeName}`;

      // 1. Upload to Storage using Insforge upload()
      const { data: uploadData, error: uploadError } = await insforge.storage
        .from('uploads')
        .upload(fileName, file);

      if (uploadError || !uploadData) throw uploadError || new Error('Upload returned empty data');

      const publicUrl = uploadData.url;

      // 3. Insert into database
      const { error: dbError } = await insforge.database.from('files').insert([{
        user_id: user.id,
        file_name: file.name,
        content_type: file.type,
        size: file.size,
        public_url: publicUrl,
      }]);

      if (dbError) throw dbError;

      // Refresh list
      fetchFiles();
    } catch (error: any) {
      console.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (e) {
      console.error('Clipboard failed');
    }
  };

  const confirmDeleteFile = async () => {
    if (!deleteConfirmFileId) return;
    
    // We only delete from DB here for simplicity, in a real app you'd also remove from Storage
    const { error } = await insforge.database.from('files').delete().eq('id', deleteConfirmFileId);
    if (error) console.error(`Delete failed: ${error.message}`);
    else fetchFiles();
    
    setDeleteConfirmFileId(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Files</h1>
          <p className="text-slate-500 text-sm mt-1">Upload and manage your universal file links.</p>
        </div>
        
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 text-sm font-medium shadow-sm"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center border-dashed border-2 bg-slate-50 hover:bg-indigo-50 transition-colors h-64 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No files uploaded</h3>
          <p className="text-slate-500 text-sm mb-6">Click the upload button to add your first file.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {files.map((file) => (
            <div key={file.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-slate-100">
                  {file.content_type?.startsWith('image/') ? (
                    <img src={file.public_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <File className="h-6 w-6 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium text-slate-900" title={file.file_name}>{file.file_name}</div>
                  <div className="text-xs text-slate-500 font-normal mt-0.5 flex gap-2">
                    <span>{formatSize(file.size)}</span>
                    <span className="text-slate-300">•</span>
                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 mt-1">
                 <button onClick={() => window.open(file.public_url, '_blank')} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-600 transition" title="View">
                  <LinkIcon className="w-3.5 h-3.5" /> View
                </button>
                <button onClick={() => copyToClipboard(file.public_url)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md text-xs font-medium text-indigo-700 transition" title="Copy URL">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <button onClick={() => setDeleteConfirmFileId(file.id)} className="flex items-center justify-center p-1.5 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-600 transition ml-2" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmFileId && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Delete File?</h3>
                <p className="text-slate-500 text-sm mb-6">Are you sure you want to delete this file? The record will be permanently removed.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirmFileId(null)}
                    className="flex-1 py-2.5 px-4 border border-slate-200 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteFile}
                    className="flex-1 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Yes, Delete
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
