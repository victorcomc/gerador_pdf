// frontend/src/App.jsx (ARQUIVO NOVO)

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DraftPage from './pages/DraftPage';

// Componente simples para verificar se o usuário está logado
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    // Se não tiver token, manda para a página de login
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota 1: Página de Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rota 2: Página do Formulário (Protegida) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DraftPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Qualquer outra rota volta para o login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;