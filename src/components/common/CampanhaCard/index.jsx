import React from 'react';
import { Trash2 } from 'lucide-react';
import './styles.css';

export function CampanhaCard({ titulo, onIniciar, onDeletar }) {
  return (
    <div className="campanha-card">
      {/* Cabeçalho do Cartão */}
      <div className="card-header">
        <h3 className="card-title">
          {titulo}
        </h3>
      </div>
      
      {/* Corpo do Cartão (Área Branca/Clara) */}
      <div className="card-body">
        {/* Botão Deletar */}
        <button 
          onClick={onDeletar}
          className="btn-delete"
          title="Deletar campanha"
        >
          <Trash2 size={20} />
        </button>
        
        {/* Botão Iniciar */}
        <button 
          onClick={onIniciar}
          className="btn-iniciar"
        >
          Iniciar
        </button>
      </div>
    </div>
  );
}