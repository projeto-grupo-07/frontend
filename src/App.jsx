import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { Navbar } from "./components/specific/Navbar";
import { DynamicRoutes } from "./components/common/DynamicRoutes/DynamicRoutes";

import Login from './pages/Login';
import AcessoNegado from './pages/AcessoNegado';

function AppManager() {
  const { signed, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ 
            width: '40px', height: '40px', border: '4px solid #e5e7eb', 
            borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#4b5563', fontFamily: 'sans-serif' }}>A carregar sistema...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }


  if (!signed) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
      
      <Navbar /> 
      
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <DynamicRoutes /> 
      </main>

    </div>
  );
}

// --- APP RAIZ ---
// Configura o Router e o Provider Global
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppManager />
      </AuthProvider>
    </BrowserRouter>
  );
}