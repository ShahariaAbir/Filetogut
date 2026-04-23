import React, { useState } from 'react';
import { insforge } from '../lib/insforge';
import { Mail, Lock, UploadCloud, Loader2 } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    try {
      if (isSignUp) {
        const { error } = await insforge.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMsg('Account created! Please check your email or sign in immediately if no confirmation is needed.');
      } else {
        const { data, error } = await insforge.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data) {
          window.dispatchEvent(new CustomEvent('insforge-login'));
        }
      }
    } catch (err: any) {
      if (err.message?.includes('is not valid JSON') || err.message?.includes('Unexpected token')) {
        setError('Error: The Insforge API URL appears to be offline or invalid. It returned an HTML page instead of the expected JSON response. Please check your Project URL.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-indigo-600 rounded flex items-center justify-center">
            <UploadCloud className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight uppercase">
          ForgeCloud
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Upload any file, get a universal link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 sm:rounded-xl sm:px-10 border border-slate-200 shadow-sm">
          <form className="space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
            {msg && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 text-sm text-green-700">
                {msg}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-tighter mb-2">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-md py-2.5 px-3 border bg-slate-50"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
               <label className="block text-xs font-semibold text-slate-700 uppercase tracking-tighter mb-2">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-md py-2.5 px-3 border bg-slate-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Sign up' : 'Sign in')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  // Simulate login for preview purposes when API is down
                  window.dispatchEvent(new CustomEvent('dev-login-bypass'));
                }}
                className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none"
              >
                Bypass Login (UI Preview Mode)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
