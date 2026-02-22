import { lazy } from 'react';

const Vendas = lazy(() => import('../pages/Vendas/index.jsx'));
const Produtos = lazy(() => import('../pages/Produtos/index.jsx'));
const Funcionarios = lazy(() => import('../pages/Funcionarios/index.jsx'));
const Comissao = lazy(() => import('../pages/Comissao/index.jsx'));
const Desempenho = lazy(() => import('../pages/Desempenho/index.jsx'));
const PainelDeVendas = lazy(() => import('../pages/PainelDeVendas/index.jsx'))

const NotFound = () => (
  <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
    <h2>Funcionalidade não encontrada</h2>
    <p>O componente solicitado não está mapeado no sistema.</p>
  </div>
);

export const COMPONENT_MAP = {
  'VENDAS_PAGE': Vendas,
  'PAINEL_VENDAS_PAGE': PainelDeVendas,
  'PRODUTOS_PAGE': Produtos,
  'FUNCIONARIOS_PAGE': Funcionarios,
  'COMISSAO_PAGE': Comissao,
  'DESEMPENHO_PAGE': Desempenho,
  
  'DEFAULT': NotFound
};