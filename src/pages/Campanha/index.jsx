import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { CampanhaCard } from '../../components/common/CampanhaCard';
import CadastrarClienteModal from '../../components/common/CadastrarClienteModal';
import CadastrarCampanhaModal from '../../components/common/CadastrarCampanhaModal';
import EditarCampanhaModal from '../../components/common/EditarCampanhaModal';
import { CampanhaService } from '../../services/CampanhaService';
import './styles.css';

export default function Campanha() {
  const [isCriarModalOpen, setIsCriarModalOpen] = useState(false);
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false);
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false);
  const [campanhaEditandoId, setCampanhaEditandoId] = useState(null);
  const [campanhas, setCampanhas] = useState([]);
  const [filtros, setFiltros] = useState({ assunto: '', status: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const aplicarFiltros = async () => {
    setIsLoading(true);
    try {
      const response = await CampanhaService.filtrar(filtros);
      if (response.status === 204) {
        setCampanhas([]);
      } else {
        setCampanhas(response.data || response || []);
      }
    } catch (error) {
      console.error(error);
      setCampanhas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const limparFiltros = () => {
    setFiltros({ assunto: '', status: '' });
    carregarCampanhas();
  };

  const carregarCampanhas = () => {
    CampanhaService.listarCampanhas()
      .then(response => {
        setCampanhas(response.data || response || []);
      })
      .catch(error => {
        console.error(error);
        setCampanhas([]);
      });
  };

  useEffect(() => {
    carregarCampanhas();
  }, []);

  const handleSalvarCliente = (dadosCliente) => {
    console.log("Enviando cliente para o Spring Boot:", dadosCliente);
    setIsCadastroModalOpen(false);
  };

  const handleSalvarCampanha = async (dadosCampanha) => {
    const payload = {
      nome: dadosCampanha.nome,
      assunto: dadosCampanha.assunto,
      corpoTexto: dadosCampanha.corpoTexto,
      genero: dadosCampanha.genero !== "" ? dadosCampanha.genero : null,
      mesAniversario: dadosCampanha.mesAniversario !== "" ? parseInt(dadosCampanha.mesAniversario) : null,
      estado: dadosCampanha.estado !== "" ? dadosCampanha.estado : null,
      cidade: dadosCampanha.cidade !== "" ? dadosCampanha.cidade : null,
      bairro: dadosCampanha.bairro !== "" ? dadosCampanha.bairro : null
    };

    try {
      const response = await CampanhaService.criarCampanha(payload);
      const novaCampanha = response.data || response;
      setCampanhas(prev => [...(prev || []), novaCampanha]);
      setIsCriarModalOpen(false);
      alert("Campanha criada com sucesso!");
    } catch (error) {
      alert("Erro: " + error.message);
    }
  };

  const handleAbrirEdicao = (id) => {
    setCampanhaEditandoId(id);
    setIsEditarModalOpen(true);
  };

  const handleIniciar = async (id) => {
    try {
      await CampanhaService.iniciarCampanha(id);
      alert("Campanha iniciada com sucesso!");
      carregarCampanhas();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletar = async (id) => {
    try {
      await CampanhaService.deletarCampanha(id);
      setCampanhas(campanhas.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="campanha-page">
      <div className="top-bar">
        <div className="btn-group">
          <button className="btn-action" onClick={() => setIsCriarModalOpen(true)}>
            Criar campanha
          </button>
        </div>

        <div className="filtros-container" style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: '#64748b' }}>Assunto</label>
            <input
              type="text"
              name="assunto"
              value={filtros.assunto}
              onChange={handleFiltroChange}
              className="input-field"
              placeholder="Digite parte do assunto..."
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: '#64748b' }}>Status</label>
            <select
              name="status"
              value={filtros.status}
              onChange={handleFiltroChange}
              className="input-field"
            >
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
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

      <div className="campanha-grid">
        {isLoading ? (
          <p>Carregando campanhas...</p>
        ) : (
          campanhas?.map((campanha) => (
            <CampanhaCard
              key={campanha.id}
              campanha={campanha}
              onIniciar={() => handleIniciar(campanha.id)}
              onDeletar={() => handleDeletar(campanha.id)}
              onEditar={() => handleAbrirEdicao(campanha.id)}
            />
          ))
        )}
      </div>

      <CadastrarClienteModal
        isOpen={isCadastroModalOpen}
        onClose={() => setIsCadastroModalOpen(false)}
        onSalvar={handleSalvarCliente}
      />

      <CadastrarCampanhaModal
        isOpen={isCriarModalOpen}
        onClose={() => setIsCriarModalOpen(false)}
        onSalvar={handleSalvarCampanha}
      />

      <EditarCampanhaModal
        isOpen={isEditarModalOpen}
        onClose={() => setIsEditarModalOpen(false)}
        campanhaId={campanhaEditandoId}
        onAtualizada={carregarCampanhas}
      />
    </div>
  );
}