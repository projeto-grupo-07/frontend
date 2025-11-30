import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/common/PrivateRoute/PrivateRoute"

// Pages
import './App.css'
import Login from './pages/Login';
import Vendas from './pages/Vendas';
import Funcionarios from './pages/Funcionarios'
import AcessoNegado from './pages/AcessoNegado'
import Comissao from './pages/Comissao'
import Desempenho from './pages/Desempenho'
import Produtos from './pages/Produtos'

// Components
import { Navbar } from "./components/specific/Navbar";

const ROLES = {
  ADMIN: 'ADMIN',
  GERENTE: 'GERENTE',
  VENDEDOR: 'VENDEDOR' 
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/sem-permissao" element={<AcessoNegado />} />
          <Route element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.GERENTE, ROLES.VENDEDOR]} />}>
            <Route path="/" element={<Navigate to="/vendas" replace />} />
            
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/produtos" element={<Produtos />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.GERENTE]} />}>
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/comissao" element={<Comissao />} />
            <Route path="/desempenho" element={<Desempenho />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
