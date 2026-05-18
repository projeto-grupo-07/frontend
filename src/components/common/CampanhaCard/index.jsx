import React from 'react';
import { Trash2, Send, Edit } from 'lucide-react'; // <-- Adicionei o Edit
import './styles.css';

const statusMap = {
  PENDENTE: { texto: 'Pendente', classe: 'status-pendente' },
  EM_ANDAMENTO: { texto: 'Enviando...', classe: 'status-andamento' },
  CONCLUIDA: { texto: 'Concluída', classe: 'status-concluida' },
  CANCELADA: { texto: 'Erro/Cancelada', classe: 'status-cancelada' },
};

export function CampanhaCard({ campanha, onIniciar, onDeletar, onEditar }) { // <-- Novo prop onEditar
  const infoStatus = statusMap[campanha.status] || { texto: 'Pendente', classe: 'status-pendente' };
  const assuntoCortado = campanha.assunto?.length > 50 
    ? campanha.assunto.substring(0, 50) + "..." 
    : campanha.assunto;

  const bloqueado = campanha.status !== 'PENDENTE' && campanha.status !== undefined;

  return (
    <div className="campanha-card">
      <div className="card-header">
        <h3 className="card-title" title={campanha.nome}>{campanha.nome}</h3>
      </div>
      
      <div className="card-body improved-body">
        <div className="card-info-section">
          <p className="info-label">Assunto do e-mail:</p>
          <p className="card-subject" title={campanha.assunto}>"{assuntoCortado || 'Sem assunto'}"</p>
        </div>

        <div className="card-status-container">
          <span className={`status-pill ${infoStatus.classe}`}>{infoStatus.texto}</span>
        </div>

        <div className="card-actions">
          {/* NOVO BOTÃO DE EDITAR */}
          <button 
            onClick={onEditar}
            className={`btn-action-icon ${bloqueado ? 'btn-disabled' : ''}`}
            disabled={bloqueado}
            title={bloqueado ? "Não é possível editar uma campanha já iniciada" : "Editar campanha e clientes"}
          >
            <Edit size={18} color={bloqueado ? "#94a3b8" : "#3b82f6"} />
          </button>

          <button onClick={onDeletar} className="btn-action-icon" title="Excluir">
            <Trash2 size={18} color="#ef4444" />
          </button>
          
          <button 
            onClick={onIniciar}
            className={`btn-iniciar ${bloqueado ? 'btn-disabled' : ''}`}
            disabled={bloqueado}
          >
            <Send size={16} style={{ marginRight: '8px' }} />
            {campanha.status === 'EM_ANDAMENTO' ? 'Enviando' : 'Iniciar'}
          </button>
        </div>
      </div>
    </div>
  );
}