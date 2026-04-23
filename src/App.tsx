import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import Auth from './pages/Auth';
import DashboardLayout from './components/DashboardLayout';
import Files from './pages/Files';
import ApiKeys from './pages/ApiKeys';
import SetupGuide from './pages/SetupGuide';
import ApiDocs from './pages/ApiDocs';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Handle dev bypass
    const handleBypass = () => {
      setSession({
        access_token: 'dev-token',
        refresh_token: 'dev-token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: { id: 'dev-user', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() }
      } as any);
    };
    window.addEventListener('dev-login-bypass', handleBypass);
    
    const handleLogoutBypass = () => {
      setSession(null);
    };
    window.addEventListener('dev-logout', handleLogoutBypass);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('dev-login-bypass', handleBypass);
      window.removeEventListener('dev-logout', handleLogoutBypass);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!session ? <Auth /> : <Navigate to="/" replace />} 
        />
        
        <Route 
          path="/" 
          element={session ? <DashboardLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/files" replace />} />
          <Route path="files" element={<Files />} />
          <Route path="api-keys" element={<ApiKeys />} />
          <Route path="docs" element={<ApiDocs />} />
          <Route path="setup" element={<SetupGuide />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
