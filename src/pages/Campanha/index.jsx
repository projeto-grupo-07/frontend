import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { CampanhaCard } from '../../components/common/CampanhaCard';
import { CadastrarClienteModal } from '../../components/common/CadastrarClienteModal';
import './styles.css';

export default function Campanha() {
  const [isCriarModalOpen, setIsCriarModalOpen] = useState(false);
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false);

  const handleSalvarCliente = (dadosCliente) => {
    console.log("Enviando cliente para o Spring Boot:", dadosCliente);
    setIsCadastroModalOpen(false); 
  };


  const [campanhas, setCampanhas] = useState([
    { id: 1, titulo: 'Dia das mães' },
    { id: 2, titulo: 'Páscoa' },
    { id: 3, titulo: 'Halloween' },
    { id: 4, titulo: 'Carnaval' },
    { id: 5, titulo: 'Mês das mulheres' },
    { id: 6, titulo: 'Natal' },
    { id: 7, titulo: 'Ofertas especiais' },
    { id: 8, titulo: 'Nova Campanha' }, 
  ]);

  const handleIniciar = (id) => {
    console.log(`Iniciando campanha ${id}`);
  };

  const handleDeletar = (id) => {
    console.log(`Deletando campanha ${id}`);
  };

  return (
    <div className="campanha-page">
      
      {/* Top Bar: Botões de Ação e Busca */}
      <div className="top-bar">
        
        {/* Grupo de Botões */}
        <div className="btn-group">
          <button className="btn-action" onClick={() => setIsCadastroModalOpen(true)}>
            Cadastrar cliente
          </button>
          <button className="btn-action">
            Criar campanha
          </button>
          <button className="btn-action">
            Buscar cliente
          </button>
        </div>

        {/* Input de Pesquisa */}
        <div className="search-container">
          <input
            type="text"
            placeholder=""
            className="search-input"
          />
          <button className="search-icon-btn">
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Grid de Campanhas */}
      <div className="campanha-grid">
        {campanhas.map((campanha) => (
          <CampanhaCard
            key={campanha.id}
            titulo={campanha.titulo}
            onIniciar={() => handleIniciar(campanha.id)}
            onDeletar={() => handleDeletar(campanha.id)}
          />
        ))}
      </div>
       <CadastrarClienteModal 
    isOpen={isCadastroModalOpen} 
        onClose={() => setIsCadastroModalOpen(false)} 
        onSalvar={handleSalvarCliente}
      />
    </div>
   
  );
}