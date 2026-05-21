import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { CampanhaService } from '../../../services/CampanhaService'; // Confirme se o caminho está correto
import './styles.css';

export default function CadastrarCampanhaModal({ isOpen, onClose, onSalvar }) {
  const estadoInicial = {
    nome: '',
    assunto: '',
    corpoTexto: '',
    genero: '',
    mesAniversario: '',
    estado: '',
    cidade: '',
    bairro: ''
  };

  const [formData, setFormData] = useState(estadoInicial);
  const [temaIA, setTemaIA] = useState('');
  const [isGerandoIA, setIsGerandoIA] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGerarComIA = async () => {
    if (!temaIA.trim()) {
      alert("Por favor, digite um tema ou instrução para a IA.");
      return;
    }

    setIsGerandoIA(true);
    try {
      const response = await CampanhaService.gerarTextoIA(temaIA);
      const dadosGerados = response.data || response;
      
      // Atualiza o Assunto e o Corpo de uma vez só
      setFormData(prev => ({
        ...prev,
        assunto: dadosGerados.assunto || prev.assunto,
        corpoTexto: dadosGerados.corpo || prev.corpoTexto
      }));
      
    } catch (error) {
      alert("Erro ao comunicar com a IA. Tente novamente.");
      console.error(error);
    } finally {
      setIsGerandoIA(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar(formData);
    setFormData(estadoInicial);
    setTemaIA('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-cadastro-content" style={{ maxWidth: '700px' }}>
        <div className="modal-cadastro-header">
          <button type="button" onClick={onClose} className="btn-close-header">
            <X size={24} />
          </button>
          <h2>Nova Campanha</h2>
          <div style={{ width: 24 }}></div>
        </div>

        <div className="modal-cadastro-body">
          <form onSubmit={handleSubmit}>
            
            {/* SESSÃO MÁGICA DA IA */}
            <div style={{ 
              backgroundColor: '#f5f3ff', 
              border: '1px solid #ddd6fe', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px' 
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6d28d9', fontSize: '1rem', marginTop: 0, marginBottom: '10px' }}>
                <Sparkles size={18} />
                Assistente de IA
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>
                Sem criatividade hoje? Diga sobre o que é a campanha e a IA escreve para você.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  value={temaIA}
                  onChange={(e) => setTemaIA(e.target.value)}
                  placeholder="Ex: Queima de estoque de calçados infantis de inverno..."
                  className="input-field"
                  style={{ flex: 1, borderColor: '#ddd6fe' }}
                />
                <button 
                  type="button" 
                  onClick={handleGerarComIA}
                  disabled={isGerandoIA}
                  style={{
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    padding: '0 15px',
                    borderRadius: '6px',
                    cursor: isGerandoIA ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600,
                    opacity: isGerandoIA ? 0.7 : 1
                  }}
                >
                  {isGerandoIA ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  {isGerandoIA ? 'Gerando...' : 'Gerar Texto'}
                </button>
              </div>
            </div>

            {/* CAMPOS ORIGINAIS DA CAMPANHA */}
            <h3 style={{ marginBottom: '10px', fontSize: '1rem', color: '#334155' }}>Dados da Campanha</h3>
            <div className="form-row">
              <label>Nome Interno da Campanha</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="input-field" required />
            </div>

            <div className="form-row">
              <label>Assunto do E-mail (O cliente vai ver)</label>
              <input type="text" name="assunto" value={formData.assunto} onChange={handleChange} className="input-field" required />
            </div>

            <div className="form-row">
              <label>Corpo do E-mail</label>
              <textarea 
                name="corpoTexto" 
                value={formData.corpoTexto} 
                onChange={handleChange} 
                className="input-field" 
                rows="6" 
                required 
              />
            </div>

            <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '1rem', color: '#334155' }}>Filtros Automáticos (Opcional)</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '15px' }}>
              Deixe em branco para ignorar o filtro.
            </p>

            <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>Gênero</label>
                <select name="genero" value={formData.genero} onChange={handleChange} className="input-field">
                  <option value="">Todos</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Mês de Aniversário</label>
                <input type="number" name="mesAniversario" value={formData.mesAniversario} onChange={handleChange} className="input-field" min="1" max="12" placeholder="Ex: 5 para Maio" />
              </div>
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>Estado (UF)</label>
                <input type="text" name="estado" value={formData.estado} onChange={handleChange} className="input-field" maxLength="2" placeholder="Ex: SP" />
              </div>
              <div style={{ flex: 2 }}>
                <label>Cidade</label>
                <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} className="input-field" />
              </div>
              <div style={{ flex: 2 }}>
                <label>Bairro</label>
                <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div className="modal-cadastro-footer">
              <button type="submit" className="btn-salvar-cadastro">
                Criar Campanha
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}