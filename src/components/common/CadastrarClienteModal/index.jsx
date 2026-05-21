import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './styles.css';

export default function CadastrarClienteModal({ isOpen, onClose, onSalvar, clienteEditando }) {
  const estadoInicial = {
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    genero: '',
    dtNasc: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    }
  };

  const [formData, setFormData] = useState(estadoInicial);

  useEffect(() => {
    if (isOpen) {
      if (clienteEditando) {
        setFormData({
          ...clienteEditando,
          endereco: clienteEditando.endereco || estadoInicial.endereco
        });
      } else {
        setFormData(estadoInicial);
      }
    }
  }, [isOpen, clienteEditando]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEnderecoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        [name]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const payload = {
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      cpf: formData.cpf,
      genero: formData.genero,
      dtNasc: formData.dtNasc,
      cep: formData.endereco.cep,
      logradouro: formData.endereco.logradouro,
      numero: formData.endereco.numero ? parseInt(formData.endereco.numero, 10) : null,
      complemento: formData.endereco.complemento,
      bairro: formData.endereco.bairro,
      cidade: formData.endereco.cidade,
      estado: formData.endereco.estado
    };

    onSalvar(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-cadastro-content" style={{ maxWidth: '600px' }}>
        <div className="modal-cadastro-header">
          <button type="button" onClick={onClose} className="btn-close-header">
            <X size={24} />
          </button>
          <h2>{clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <div style={{ width: 24 }}></div>
        </div>

        <div className="modal-cadastro-body">
          <form onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: '10px', fontSize: '1rem', color: '#334155' }}>Dados Pessoais</h3>
            <div className="form-row">
              <label>Nome</label>
              <input type="text" name="nome" value={formData.nome || ''} onChange={handleChange} className="input-field" required />
            </div>
            
            <div className="form-row">
              <label>E-mail</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="input-field" required />
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>CPF</label>
                <input type="text" name="cpf" value={formData.cpf || ''} onChange={handleChange} className="input-field" />
              </div>
              <div style={{ flex: 1 }}>
                <label>Telefone</label>
                <input type="text" name="telefone" value={formData.telefone || ''} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>Data de Nascimento</label>
                <input type="date" name="dtNasc" value={formData.dtNasc || ''} onChange={handleChange} className="input-field" required />
              </div>
              <div style={{ flex: 1 }}>
                <label>Gênero</label>
                <select name="genero" value={formData.genero || ''} onChange={handleChange} className="input-field" required>
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outro</option>
                </select>
              </div>
            </div>

            <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1rem', color: '#334155' }}>Endereço</h3>
            
            <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>CEP (ex: 00000-000)</label>
                <input type="text" name="cep" value={formData.endereco.cep || ''} onChange={handleEnderecoChange} className="input-field" required />
              </div>
              <div style={{ flex: 2 }}>
                <label>Logradouro</label>
                <input type="text" name="logradouro" value={formData.endereco.logradouro || ''} onChange={handleEnderecoChange} className="input-field" required />
              </div>
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>Número</label>
                <input type="number" name="numero" value={formData.endereco.numero || ''} onChange={handleEnderecoChange} className="input-field" required />
              </div>
              <div style={{ flex: 2 }}>
                <label>Complemento</label>
                <input type="text" name="complemento" value={formData.endereco.complemento || ''} onChange={handleEnderecoChange} className="input-field" />
              </div>
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 2 }}>
                <label>Bairro</label>
                <input type="text" name="bairro" value={formData.endereco.bairro || ''} onChange={handleEnderecoChange} className="input-field" required />
              </div>
              <div style={{ flex: 2 }}>
                <label>Cidade</label>
                <input type="text" name="cidade" value={formData.endereco.cidade || ''} onChange={handleEnderecoChange} className="input-field" required />
              </div>
              <div style={{ flex: 1 }}>
                <label>Estado (ex: SP)</label>
                <input type="text" name="estado" value={formData.endereco.estado || ''} onChange={handleEnderecoChange} className="input-field" maxLength="2" required />
              </div>
            </div>

            <div className="modal-cadastro-footer">
              <button type="submit" className="btn-salvar-cadastro">
                {clienteEditando ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}