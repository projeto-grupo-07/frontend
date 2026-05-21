import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { ClienteService } from '../../services/ClienteService';
import CadastrarClienteModal from '../../components/common/CadastrarClienteModal';
import './styles.css';

export default function ClientePage() {
  const [clientes, setClientes] = useState([]);
  const [filtros, setFiltros] = useState({ nome: '', genero: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null);

  const carregarClientes = () => {
    setIsLoading(true);
    ClienteService.listar()
      .then(response => {
        if (response.status === 204) {
          setClientes([]);
        } else {
          setClientes(response.data || response || []);
        }
      })
      .catch(error => {
        console.error(error);
        setClientes([]);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const aplicarFiltros = async () => {
    setIsLoading(true);
    try {
      const response = await ClienteService.filtrar(filtros);
      if (response.status === 204) {
        setClientes([]);
      } else {
        setClientes(response.data || response || []);
      }
    } catch (error) {
      console.error(error);
      setClientes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const limparFiltros = () => {
    setFiltros({ nome: '', genero: '' });
    carregarClientes();
  };

  const handleDeletar = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await ClienteService.deletar(id);
        setClientes(clientes.filter(cliente => cliente.id !== id));
      } catch (error) {
        alert('Erro ao excluir cliente.');
      }
    }
  };

  const handleAbrirModalCadastro = () => {
    setClienteEmEdicao(null);
    setIsModalOpen(true);
  };

  const handleAbrirModalEdicao = (cliente) => {
    setClienteEmEdicao(cliente);
    setIsModalOpen(true);
  };

  const handleSalvarCliente = async (dadosFormulario) => {
    try {
      if (clienteEmEdicao) {
        await ClienteService.atualizar(clienteEmEdicao.id, dadosFormulario);
        alert("Cliente atualizado com sucesso!");
      } else {
        await ClienteService.cadastrar(dadosFormulario);
        alert("Cliente cadastrado com sucesso!");
      }
      setIsModalOpen(false);
      carregarClientes();
    } catch (error) {
      alert("Erro ao salvar cliente.");
      console.error(error);
    }
  };

  return (
    <div className="cliente-page">
      <div className="top-bar">
        <button className="btn-novo-cliente" onClick={handleAbrirModalCadastro}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Novo Cliente
        </button>

        <div className="filtros-container" style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: '#64748b' }}>Nome</label>
            <input
              type="text"
              name="nome"
              value={filtros.nome}
              onChange={handleFiltroChange}
              className="input-field"
              placeholder="Digite parte do nome..."
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: '#64748b' }}>Gênero</label>
            <select
              name="genero"
              value={filtros.genero}
              onChange={handleFiltroChange}
              className="input-field"
            >
              <option value="">Todos</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
            <button onClick={aplicarFiltros} className="btn-novo-cliente">
              Filtrar
            </button>
            <button onClick={limparFiltros} className="btn-novo-cliente" style={{ backgroundColor: '#94a3b8' }}>
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando clientes...</p>
        ) : (
          <table className="clientes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Gênero</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.id}</td>
                    <td className="font-medium">{cliente.nome}</td>
                    <td>{cliente.email}</td>
                    <td>{cliente.telefone || '-'}</td>
                    <td>{cliente.genero || '-'}</td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="btn-icon btn-edit" 
                          title="Editar"
                          onClick={() => handleAbrirModalEdicao(cliente)}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="btn-icon btn-delete" 
                          title="Excluir"
                          onClick={() => handleDeletar(cliente.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <CadastrarClienteModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSalvar={handleSalvarCliente}
        clienteEditando={clienteEmEdicao}
      />
    </div>
  );
}