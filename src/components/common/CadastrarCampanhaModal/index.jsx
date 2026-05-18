import React, { useState } from 'react';
import { X } from 'lucide-react';
import './styles.css';

export default function CadastrarCampanhaModal({ isOpen, onClose, onSalvar }) {
  const [formData, setFormData] = useState({
    nome: '',
    assunto: '',
    corpoTexto: '',
    genero: '',
    mesAniversario: '',
    estado: '',
    cidade: '',
    bairro: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenderSelect = (genero) => {
    setFormData(prev => ({ ...prev, genero }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Apenas envia os dados brutos para a página principal processar
      if (onSalvar) {
        await onSalvar(formData);
      }
      
      // Limpa o formulário caso seja salvo com sucesso
      setFormData({
        nome: '', assunto: '', corpoTexto: '', genero: '',
        mesAniversario: '', estado: '', cidade: '', bairro: ''
      });
    } catch (error) {
      console.error("Erro ao processar modal", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-cadastro-content">
        <div className="modal-cadastro-header">
          <button type="button" onClick={onClose} className="btn-close-header">
            <X size={24} />
          </button>
          <h2>Criar Nova Campanha</h2>
          <div style={{ width: 24 }}></div>
        </div>

        <form onSubmit={handleSubmit} className="modal-cadastro-body">
          <div className="form-row">
            <label>Nome (Interno)</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="input-field" required />
          </div>

          <div className="form-row">
            <label>Assunto</label>
            <input type="text" name="assunto" value={formData.assunto} onChange={handleChange} className="input-field" required />
          </div>

          <div className="form-row" style={{ alignItems: 'flex-start' }}>
            <label style={{ marginTop: '10px' }}>Corpo do E-mail</label>
            <textarea name="corpoTexto" rows="4" value={formData.corpoTexto} onChange={handleChange} className="input-field" required style={{ resize: 'vertical' }} />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #93c5fd', margin: '20px 0' }} />

          <div className="form-row">
            <label>Gênero Alvo</label>
            <div className="gender-toggle">
              <button type="button" className={`gender-btn ${formData.genero === '' ? 'active' : ''}`} onClick={() => handleGenderSelect('')}>Todos</button>
              <button type="button" className={`gender-btn ${formData.genero === 'M' ? 'active' : ''}`} onClick={() => handleGenderSelect('M')}>Homens</button>
              <button type="button" className={`gender-btn ${formData.genero === 'F' ? 'active' : ''}`} onClick={() => handleGenderSelect('F')}>Mulheres</button>
            </div>
          </div>

          <div className="form-row">
            <label>Mês Aniversário</label>
            <select name="mesAniversario" value={formData.mesAniversario} onChange={handleChange} className="input-field">
              <option value="">Qualquer mês</option>
              <option value="1">Janeiro</option>
              <option value="2">Fevereiro</option>
              <option value="3">Março</option>
              <option value="4">Abril</option>
              <option value="5">Maio</option>
              <option value="6">Junho</option>
              <option value="7">Julho</option>
              <option value="8">Agosto</option>
              <option value="9">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>
          </div>

          <div className="form-row">
            <label>Estado (UF)</label>
            <input type="text" name="estado" maxLength="2" value={formData.estado} onChange={handleChange} className="input-field" />
          </div>

          <div className="form-row">
            <label>Cidade</label>
            <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} className="input-field" />
          </div>

          <div className="form-row">
            <label>Bairro</label>
            <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} className="input-field" />
          </div>

          <div className="modal-cadastro-footer">
             <button type="submit" className="btn-salvar-cadastro" disabled={isLoading}>
                {isLoading ? 'Criando...' : 'Criar Campanha'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}