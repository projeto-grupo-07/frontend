import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './styles.css';

// ==========================================
// FUNÇÕES AUXILIARES: MÁSCARAS E VALIDAÇÕES
// ==========================================
const mascaraCPF = (valor) => {
  return valor
    .replace(/\D/g, '') // Remove tudo o que não é dígito
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1'); // Limita a 14 caracteres
};

const mascaraTelefone = (valor) => {
  return valor
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1'); // Limita a 15 caracteres
};

const mascaraCEP = (valor) => {
  return valor
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1'); // Limita a 9 caracteres
};

const validarCPF = (cpfCru) => {
  const cpf = cpfCru.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
  let soma = 0;
  let resto;
  
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function CadastrarClienteModal({ isOpen, onClose, onSalvar, clienteEditando }) {
  const estadoInicial = {
    nome: '', email: '', telefone: '', cpf: '', genero: '', dtNasc: '',
    endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' }
  };

  const [formData, setFormData] = useState(estadoInicial);
  const [erros, setErros] = useState({});
  const [buscandoCep, setBuscandoCep] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErros({}); // Limpa erros ao abrir
      if (clienteEditando) {
        setFormData({
          ...clienteEditando,
          cpf: mascaraCPF(clienteEditando.cpf || ''),
          telefone: mascaraTelefone(clienteEditando.telefone || ''),
          endereco: {
            ...estadoInicial.endereco,
            ...clienteEditando.endereco,
            cep: mascaraCEP(clienteEditando.endereco?.cep || '')
          }
        });
      } else {
        setFormData(estadoInicial);
      }
    }
  }, [isOpen, clienteEditando]);

  // --- HANDLERS COM MÁSCARAS INJETADAS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    let valorFormatado = value;

    if (name === 'cpf') valorFormatado = mascaraCPF(value);
    if (name === 'telefone') valorFormatado = mascaraTelefone(value);

    setFormData(prev => ({ ...prev, [name]: valorFormatado }));
    
    // Limpa o erro do campo se o usuário voltar a digitar
    if (erros[name]) setErros(prev => ({ ...prev, [name]: null }));
  };

  const handleEnderecoChange = async (e) => {
    const { name, value } = e.target;
    let valorFormatado = value;

    if (name === 'cep') {
      valorFormatado = mascaraCEP(value);
      
      // Limpa erro de CEP
      if (erros.cep) setErros(prev => ({ ...prev, cep: null }));

      // BUSCA VIACEP AUTOMÁTICA
      const cepLimpo = valorFormatado.replace(/\D/g, '');
      if (cepLimpo.length === 8) {
        buscarCepApi(cepLimpo);
      }
    }

    setFormData(prev => ({
      ...prev,
      endereco: { ...prev.endereco, [name]: valorFormatado }
    }));
  };

  const buscarCepApi = async (cepLimpo) => {
    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            logradouro: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          }
        }));
      } else {
        setErros(prev => ({ ...prev, cep: 'CEP não encontrado' }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setBuscandoCep(false);
    }
  };

  // --- VALIDAÇÃO NO SUBMIT ---
  const handleSubmit = (e) => {
    e.preventDefault();
    const novosErros = {};

    // Valida CPF
    if (formData.cpf && !validarCPF(formData.cpf)) {
      novosErros.cpf = 'CPF inválido';
    }

    // Valida CEP
    const cepLimpo = formData.endereco.cep.replace(/\D/g, '');
    if (cepLimpo.length > 0 && cepLimpo.length !== 8) {
      novosErros.cep = 'CEP incompleto';
    }

    // Se houver erros, aborta e exibe na tela
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    // Preparar Payload (removendo caracteres especiais do CPF e CEP para mandar pro backend)
    const payload = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ''),
      telefone: formData.telefone.replace(/\D/g, ''),
      cep: formData.endereco.cep,
      numero: formData.endereco.numero ? parseInt(formData.endereco.numero, 10) : null,
      // Puxando tudo pro primeiro nível do payload para bater com o seu original
      logradouro: formData.endereco.logradouro,
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
                <input 
                  type="text" 
                  name="cpf" 
                  value={formData.cpf || ''} 
                  onChange={handleChange} 
                  className={`input-field ${erros.cpf ? 'input-error' : ''}`} 
                  placeholder="000.000.000-00"
                />
                {erros.cpf && <span style={{ color: '#ef4444', fontSize: '12px' }}>{erros.cpf}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <label>Telefone</label>
                <input 
                  type="text" 
                  name="telefone" 
                  value={formData.telefone || ''} 
                  onChange={handleChange} 
                  className="input-field" 
                  placeholder="(00) 00000-0000"
                />
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
                <label>
                  CEP {buscandoCep && <span style={{ fontSize: '11px', color: '#3b82f6' }}>(Buscando...)</span>}
                </label>
                <input 
                  type="text" 
                  name="cep" 
                  value={formData.endereco.cep || ''} 
                  onChange={handleEnderecoChange} 
                  className={`input-field ${erros.cep ? 'input-error' : ''}`} 
                  placeholder="00000-000"
                  required 
                />
                {erros.cep && <span style={{ color: '#ef4444', fontSize: '12px' }}>{erros.cep}</span>}
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
                <label>Estado</label>
                <input type="text" name="estado" value={formData.endereco.estado || ''} onChange={handleEnderecoChange} className="input-field" maxLength="2" required />
              </div>
            </div>

            <div className="modal-cadastro-footer">
              <button type="submit" className="btn-salvar-cadastro" disabled={buscandoCep}>
                {clienteEditando ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}