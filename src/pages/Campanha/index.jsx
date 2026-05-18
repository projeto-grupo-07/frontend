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
          <button className="btn-action" onClick={() => setIsCadastroModalOpen(true)}>
            Cadastrar cliente
          </button>
          <button className="btn-action" onClick={() => setIsCriarModalOpen(true)}>
            Criar campanha
          </button>
          <button className="btn-action">
            Buscar cliente
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Pesquisar..."
            className="search-input"
          />
          <button className="search-icon-btn">
            <Search size={20} />
          </button>
        </div>
      </div>

      <div className="campanha-grid">
        {campanhas?.map((campanha) => (
          <CampanhaCard
            key={campanha.id}
            campanha={campanha}
            onIniciar={() => handleIniciar(campanha.id)}
            onDeletar={() => handleDeletar(campanha.id)}
            onEditar={() => handleAbrirEdicao(campanha.id)}
          />
        ))}
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