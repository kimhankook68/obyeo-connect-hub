
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App.tsx';
import Auth from './pages/Auth.tsx';
import { supabase } from "./integrations/supabase/client";
import './index.css';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthenticated(!!session);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">로딩 중...</div>;
  }

  return authenticated ? children : <Navigate to="/auth" replace />;
};

const Main = () => {
  return (
    <BrowserRouter>
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(<Main />);
