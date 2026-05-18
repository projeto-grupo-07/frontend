import React, { useState, useEffect } from 'react';
import { X, UserMinus, Plus } from 'lucide-react';
import { CampanhaService } from '../../../services/CampanhaService';
import './styles.css';

export default function EditarCampanhaModal({ isOpen, onClose, campanhaId, onAtualizada }) {
  const [activeTab, setActiveTab] = useState('detalhes'); // 'detalhes' ou 'clientes'
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para os detalhes da campanha
  const [formData, setFormData] = useState({ nome: '', assunto: '', corpoTexto: '' });
  
  // Estado para os clientes
  const [clientes, setClientes] = useState([]);
  const [novoClienteId, setNovoClienteId] = useState('');

  // Carrega os dados quando o modal abre
  useEffect(() => {
    if (isOpen && campanhaId) {
      carregarDados();
    }
  }, [isOpen, campanhaId]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      const respCampanha = await CampanhaService.buscarCampanhaPorId(campanhaId);
      setFormData(respCampanha.data || respCampanha);

      const respClientes = await CampanhaService.listarClientesDaCampanha(campanhaId);
      setClientes(respClientes.data || respClientes || []);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalvarDetalhes = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await CampanhaService.atualizarCampanha(campanhaId, formData);
      alert("Campanha atualizada com sucesso!");
      if(onAtualizada) onAtualizada(); // Avisa a página principal para recarregar a grid
    } catch (error) {
      alert("Erro ao atualizar campanha.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoverCliente = async (clienteId) => {
    try {
      await CampanhaService.removerCliente(campanhaId, clienteId);
      setClientes(clientes.filter(c => c.id !== clienteId));
    } catch (error) {
      alert("Erro ao remover cliente da lista.");
    }
  };

  const handleAdicionarCliente = async () => {
    if(!novoClienteId) return;
    try {
      await CampanhaService.adicionarCliente(campanhaId, novoClienteId);
      setNovoClienteId('');
      carregarDados(); // Recarrega a lista para mostrar o novo cliente com nome
    } catch (error) {
      alert("Erro ao adicionar cliente. Verifique se o ID existe.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-cadastro-content" style={{ maxWidth: '700px' }}>
        
        <div className="modal-cadastro-header">
          <button type="button" onClick={onClose} className="btn-close-header"><X size={24} /></button>
          <h2>Gerenciar Campanha</h2>
          <div style={{ width: 24 }}></div>
        </div>

        {/* Sistema de Abas */}
        <div className="modal-tabs">
          <button className={`tab-btn ${activeTab === 'detalhes' ? 'active' : ''}`} onClick={() => setActiveTab('detalhes')}>
            Detalhes da Campanha
          </button>
          <button className={`tab-btn ${activeTab === 'clientes' ? 'active' : ''}`} onClick={() => setActiveTab('clientes')}>
            Lista de Clientes ({clientes.length})
          </button>
        </div>

        <div className="modal-cadastro-body" style={{ minHeight: '350px' }}>
          {isLoading ? (
            <p style={{textAlign: 'center', marginTop: '20px'}}>Carregando...</p>
          ) : (
            <>
              {/* ABA 1: DETALHES */}
              {activeTab === 'detalhes' && (
                <form onSubmit={handleSalvarDetalhes}>
                  <div className="form-row">
                    <label>Nome</label>
                    <input type="text" value={formData.nome || ''} onChange={e => setFormData({...formData, nome: e.target.value})} className="input-field" required />
                  </div>
                  <div className="form-row">
                    <label>Assunto</label>
                    <input type="text" value={formData.assunto || ''} onChange={e => setFormData({...formData, assunto: e.target.value})} className="input-field" required />
                  </div>
                  <div className="form-row" style={{ alignItems: 'flex-start' }}>
                    <label style={{ marginTop: '10px' }}>Corpo do Texto</label>
                    <textarea rows="6" value={formData.corpoTexto || ''} onChange={e => setFormData({...formData, corpoTexto: e.target.value})} className="input-field" required />
                  </div>
                  <div className="modal-cadastro-footer">
                     <button type="submit" className="btn-salvar-cadastro">Salvar Alterações</button>
                  </div>
                </form>
              )}

              {/* ABA 2: CLIENTES */}
              {activeTab === 'clientes' && (
                <div className="clientes-manager">
                  
                  {/* Formulário para Adicionar novo */}
                  <div className="add-cliente-bar">
                    <input 
                      type="number" 
                      placeholder="ID do Cliente..." 
                      className="input-field" 
                      value={novoClienteId} 
                      onChange={e => setNovoClienteId(e.target.value)} 
                    />
                    <button type="button" onClick={handleAdicionarCliente} className="btn-salvar-cadastro" style={{display: 'flex', gap: '5px'}}>
                      <Plus size={18}/> Adicionar
                    </button>
                  </div>

                  {/* Tabela de Clientes da Campanha */}
                  <div className="table-container">
                    <table className="clientes-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nome</th>
                          <th>Email</th>
                          <th>Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientes.length === 0 ? (
                          <tr><td colSpan="4" style={{textAlign: 'center'}}>Nenhum cliente associado ainda.</td></tr>
                        ) : (
                          clientes.map(cliente => (
                            <tr key={cliente.id}>
                              <td>{cliente.id}</td>
                              <td>{cliente.nome}</td>
                              <td>{cliente.email}</td>
                              <td style={{textAlign: 'center'}}>
                                <button type="button" onClick={() => handleRemoverCliente(cliente.id)} className="btn-remove-cliente" title="Remover da Campanha">
                                  <UserMinus size={18} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}