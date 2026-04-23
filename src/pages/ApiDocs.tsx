import { Code, Terminal } from 'lucide-react';

export default function ApiDocs() {
  const originUrl = window.location.origin;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">API Documentation</h1>
        <p className="text-slate-500 text-sm mt-1">Integrate ForgeDrive into your applications.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
           <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-1 rounded tracking-tight">POST</span>
           <code className="text-xs font-mono text-slate-800 break-all">{originUrl}/api/upload</code>
        </div>
        
        <div className="p-4 overflow-y-auto text-xs space-y-6">
          <div>
            <h3 className="font-semibold text-slate-700 mb-2 uppercase tracking-tighter text-[10px]">Description</h3>
            <p className="text-slate-600 text-[13px] leading-relaxed">Uploads a file to your universal bucket and returns a public URL. Requires a valid API key.</p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-700 mb-2 uppercase tracking-tighter text-[10px]">Authentication</h3>
            <p className="text-slate-600 mb-2 text-[13px] leading-relaxed">Pass your API key using the standard Bearer Token authorization header:</p>
            <div className="bg-slate-900 text-slate-300 p-3 rounded-lg font-mono leading-relaxed overflow-x-auto text-[11px] shadow-inner">
              <pre>
                Authorization: Bearer sk_your_key
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-700 mb-2 uppercase tracking-tighter text-[10px]">Request Format (multipart/form-data)</h3>
            <div className="border border-slate-100 rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <div className="p-2.5 border-b border-r border-slate-100">Key</div>
                <div className="p-2.5 border-b border-r border-slate-100">Type</div>
                <div className="p-2.5 border-b border-slate-100">Details</div>
              </div>
              <div className="grid grid-cols-3 text-xs">
                <div className="p-2.5 border-r border-slate-100 font-mono text-indigo-600 font-medium">file</div>
                <div className="p-2.5 border-r border-slate-100 text-slate-500">File Blob</div>
                <div className="p-2.5 text-slate-500">The file to upload.</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-700 mb-2 uppercase tracking-tighter text-[10px]">Example Request using cURL</h3>
            <div className="bg-slate-900 text-slate-300 p-3 rounded-lg font-mono leading-relaxed overflow-x-auto text-[11px] shadow-inner">
              <pre className="whitespace-pre-wrap">
{`curl -X POST ${originUrl}/api/upload \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -F "file=@/path/to/image.png"`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-700 mb-2 uppercase tracking-tighter text-[10px]">Response</h3>
            <p className="text-slate-600 text-[13px] mb-2 leading-relaxed">Returns a JSON object containing the universal link if successful.</p>
            <div className="bg-slate-900 text-slate-300 p-3 rounded-lg font-mono leading-relaxed overflow-x-auto text-[10px] shadow-inner">
              <pre>
{`{
  "success": true,
  "message": "File uploaded",
  "url": "https://...",
  "file": {
    "name": "image.png",
    "size": 10245,
    "type": "image/png"
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
