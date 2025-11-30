import React, { useContext, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext.jsx';
import { COMPONENT_MAP } from '../../../config/ComponentMap.jsx';

const LoadingModule = () => (
  <div className="flex justify-center items-center h-full p-10">
    <div style={{ color: '#2563EB', fontWeight: '500' }}>Carregando módulo...</div>
  </div>
);

export function DynamicRoutes() {
  const { user, signed } = useContext(AuthContext);

  if (!signed || !user?.menu || user.menu.length === 0) {
    return <Navigate to="/login" replace />;
  }

  const defaultPath = user.menu[0].path;

  return (
    <Suspense fallback={<LoadingModule />}>
      <Routes>
        <Route path="/" element={<Navigate to={defaultPath} replace />} />

        {user.menu.map((item) => {
          const Component = COMPONENT_MAP[item.componentKey] || COMPONENT_MAP['DEFAULT'];
          
          return (
            <Route 
              key={item.path} 
              path={item.path} 
              element={<Component />} 
            />
          );
        })}

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
  );
}