import { useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

export default function ApiDocs() {
  const originUrl = window.location.origin;
  const [baseUrl, setBaseUrl] = useState(originUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    status: number;
    message: string;
  } | null>(null);

  const runApiTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
      const response = await fetch(`${normalizedBaseUrl}/api/health`, {
        method: 'GET',
      });
      const responseText = await response.text();
      setTestResult({
        ok: response.ok,
        status: response.status,
        message: responseText || 'No response body',
      });
    } catch (error: any) {
      setTestResult({
        ok: false,
        status: 0,
        message: error?.message || 'Unable to reach API',
      });
    } finally {
      setTesting(false);
    }
  };

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
            <h3 className="font-semibold text-slate-700 mb-2 uppercase tracking-tighter text-[10px]">Test API</h3>
            <p className="text-slate-600 text-[13px] mb-3 leading-relaxed">
              Quickly verify that your API URL is reachable and CORS-ready by testing <span className="font-mono">/api/health</span>.
            </p>
            <div className="space-y-3 rounded-lg border border-slate-200 p-3 bg-slate-50">
              <div className="space-y-1">
                <label htmlFor="api-base-url" className="block text-[11px] font-semibold tracking-wide text-slate-600 uppercase">
                  API Base URL
                </label>
                <input
                  id="api-base-url"
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://filetogut.vercel.app"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <button
                type="button"
                onClick={runApiTest}
                disabled={testing || !baseUrl.trim()}
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {testing ? 'Testing...' : 'Test API'}
              </button>

              {testResult ? (
                <div className={`rounded-md border px-3 py-2 text-xs ${testResult.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                  <div className="mb-1 flex items-center gap-1.5 font-semibold">
                    {testResult.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    Status: {testResult.status}
                  </div>
                  <pre className="whitespace-pre-wrap break-all font-mono text-[11px]">{testResult.message}</pre>
                </div>
              ) : null}
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
