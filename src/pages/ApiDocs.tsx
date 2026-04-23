import { Code, Terminal } from 'lucide-react';

export default function ApiDocs() {
  const originUrl = window.location.origin;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">API Documentation</h1>
        <p className="text-slate-500 text-sm mt-1">Integrate ForgeDrive into your applications.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
           <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-1 rounded tracking-tight">POST</span>
           <code className="text-sm font-mono text-slate-800">{originUrl}/api/upload</code>
        </div>
        
        <div className="p-6 overflow-y-auto text-xs space-y-6">
          <div>
            <h3 className="font-semibold text-slate-700 mb-2 uppercase tracking-tighter">Description</h3>
            <p className="text-slate-600 text-sm">Uploads a file to your universal bucket and returns a public URL. Requires a valid API key.</p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-700 mb-2 uppercase tracking-tighter">Authentication</h3>
            <p className="text-slate-600 mb-2 text-sm">Pass your API key using the standard Bearer Token authorization header:</p>
            <div className="bg-slate-900 text-slate-300 p-3 rounded font-mono leading-relaxed overflow-x-auto">
              <pre>
                Authorization: Bearer sk_your_api_key_here
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-700 mb-2 uppercase tracking-tighter">Request Format (multipart/form-data)</h3>
            <table className="w-full text-left border-collapse border border-slate-100 rounded-lg">
              <thead className="bg-slate-50">
                <tr className="text-[10px] font-semibold text-slate-400 uppercase">
                  <th className="px-6 py-3 border-b">Key</th>
                  <th className="px-6 py-3 border-b">Type</th>
                  <th className="px-6 py-3 border-b">Description</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 border-b font-mono text-indigo-600 text-xs text-medium">file</td>
                  <td className="px-6 py-4 border-b text-slate-500">File Blob</td>
                  <td className="px-6 py-4 border-b text-slate-500">The file you want to upload.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-semibold text-slate-700 mb-2 uppercase tracking-tighter">Example Request using cURL</h3>
            <div className="bg-slate-900 text-slate-300 p-3 rounded font-mono leading-relaxed overflow-x-auto">
              <pre className="whitespace-pre-wrap">
{`curl -X POST ${originUrl}/api/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@/path/to/your/image.png"`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-700 mb-2 uppercase tracking-tighter">Response</h3>
            <p className="text-slate-600 text-sm mb-2">Returns a JSON object containing the universal link if successful.</p>
            <div className="bg-slate-900 text-slate-300 p-3 rounded font-mono leading-relaxed overflow-x-auto text-[11px]">
              <pre>
{`{
  "success": true,
  "message": "File uploaded successfully",
  "url": "https://ij78z9ah.ap-southeast.insforge.app/storage/v1/object/public/uploads/...",
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
