import React, { useState } from 'react';
import { X } from 'lucide-react';
import './styles.css';

export default function CadastrarClienteModal({ isOpen, onClose, onSalvar  }) { 
    const [formData, setFormData] = useState({
    genero: 'Mulher', // Valor padrão selecionado na imagem
    email: '',
    nome: '',
    dataNascimento: '',
    telefone: '',
    cpf: '',
    cep: '',
    complemento: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenderSelect = (genero) => {
    setFormData(prev => ({ ...prev, genero }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados salvos:", formData);
    if(onSalvar) onSalvar(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-cadastro-content">
        
        {/* Cabeçalho */}
        <div className="modal-cadastro-header">
          <button type="button" onClick={onClose} className="btn-close-header">
            <X size={24} />
          </button>
          <h2>Cadastro de Clientes</h2>
          <div style={{ width: 24 }}></div> {/* Espaçador para centralizar o título */}
        </div>

        {/* Corpo do Formulário */}
        <form onSubmit={handleSubmit} className="modal-cadastro-body">
          
          {/* Linha: Gênero */}
          <div className="form-row">
            <label>Gênero</label>
            <div className="gender-toggle">
              {['Mulher', 'Homem', 'Outros'].map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  className={`gender-btn ${formData.genero === opcao ? 'active' : ''}`}
                  onClick={() => handleGenderSelect(opcao)}
                >
                  {opcao}
                </button>
              ))}
            </div>
          </div>

          {/* Linha: E-mail */}
          <div className="form-row">
            <label>E-mail</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" />
          </div>

          {/* Linha: Nome */}
          <div className="form-row">
            <label>Nome</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="input-field" />
          </div>

          {/* Linha: Data Nascimento */}
          <div className="form-row">
            <label>Data Nascimento</label>
            <input 
              type="date" 
              name="dataNascimento" 
              value={formData.dataNascimento} 
              onChange={handleChange} 
              className="input-field" 
              required
            />
          </div>

          {/* Linha: Telefone */}
          <div className="form-row">
            <label>Telefone</label>
            <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} className="input-field" />
          </div>

          {/* Linha: CPF */}
          <div className="form-row">
            <label>CPF</label>
            <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} className="input-field" />
          </div>

          {/* Linha: CEP e Complemento */}
          <div className="form-row dual-field-row">
            <div className="field-group">
              <label>CEP</label>
              <input type="text" name="cep" value={formData.cep} onChange={handleChange} className="input-field" />
            </div>
            
          </div>
          <div className="field-group">
              <label className="label-complemento">Complemento</label>
              <input type="text" name="complemento" value={formData.complemento} onChange={handleChange} className="input-field" />
            </div>

          {/* Botão de salvar invisível na imagem, mas necessário para o form funcionar */}
          <div className="modal-cadastro-footer">
             <button type="submit" className="btn-salvar-cadastro">Salvar Cliente</button>
          </div>

        </form>
      </div>
    </div>
  );
}

