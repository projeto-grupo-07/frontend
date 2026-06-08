import React, { useState } from 'react';
import { X, Sparkles, Loader2, AlertCircle } from 'lucide-react'; // Adicionado AlertCircle
import { CampanhaService } from '../../../services/CampanhaService';
import './styles.css';

export default function CadastrarCampanhaModal({ isOpen, onClose, onSalvar }) {
  const estadoInicial = {
    nome: '', assunto: '', corpoTexto: '', genero: '',
    mesAniversario: '', estado: '', cidade: '', bairro: ''
  };

  const [formData, setFormData] = useState(estadoInicial);
  const [temaIA, setTemaIA] = useState('');
  const [isGerandoIA, setIsGerandoIA] = useState(false);
  
  // Novos estados para gerenciar o erro e o carregamento do botão salvar
  const [erroBackend, setErroBackend] = useState('');
  const [isSalvando, setIsSalvando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpa a mensagem de erro se o usuário voltar a digitar algo
    if (erroBackend) setErroBackend('');
  };

  const handleGerarComIA = async () => {
    if (!temaIA.trim()) {
      setErroBackend("Por favor, digite um tema ou instrução para a IA.");
      return;
    }

    setIsGerandoIA(true);
    setErroBackend(''); // Limpa o erro ao tentar de novo
    
    try {
      const response = await CampanhaService.gerarTextoIA(temaIA);
      const dadosGerados = response.data || response;
      
      setFormData(prev => ({
        ...prev,
        assunto: dadosGerados.assunto || prev.assunto,
        corpoTexto: dadosGerados.corpo || prev.corpoTexto
      }));
      
    } catch (error) {
      // Captura a mensagem do Spring Boot e joga na modalzinha
      if (error.response && error.response.data) {
        setErroBackend(typeof error.response.data === 'string' 
          ? error.response.data 
          : "Erro ao comunicar com a IA.");
      } else {
        setErroBackend("A IA demorou muito para responder. Verifique sua conexão e tente novamente.");
      }
    } finally {
      setIsGerandoIA(false);
    }
  };

  // Alterado para async para poder capturar o erro da API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroBackend('');
    setIsSalvando(true);

    try {
      // Espera a resposta da função pai
      await onSalvar(formData);
      
      // Só limpa o form se a requisição deu sucesso (HTTP 200)
      setFormData(estadoInicial);
      setTemaIA('');
    } catch (error) {
      // Extrai a mensagem enviada pelo Spring Boot de dentro do objeto do Axios
      if (error.response && error.response.data) {
        // Se a mensagem vier como string direta ou dentro de um objeto { message: "..." }
        const mensagemErro = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || "Critérios inválidos. Nenhum cliente encontrado.";
        
        setErroBackend(mensagemErro);
      } else {
        setErroBackend("Erro de conexão com o servidor. Tente novamente.");
      }
    } finally {
      setIsSalvando(false);
    }
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
          {/* MODALZINHA IMPROVISADA DE ERRO */}
        {erroBackend && (
          <div style={{
            position: 'fixed', // Fica cravado no meio da tela do usuário, mesmo se ele rolar a página
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fundo escurecido
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999 // Fica acima de todas as outras camadas
          }}>
            <div style={{
              backgroundColor: '#fff',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              maxWidth: '350px',
              borderTop: '5px solid #ef4444', // Detalhe vermelho em cima
              animation: 'fadeIn 0.2s ease-in-out' // Suavidade ao abrir
            }}>
              <AlertCircle size={50} color="#ef4444" style={{ margin: '0 auto 15px auto' }} />
              <h3 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '1.25rem' }}>Atenção</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.5' }}>
                {erroBackend}
              </p>
              <button 
                type="button"
                onClick={() => setErroBackend('')} // Fecha a modalzinha e volta pro form
                style={{ 
                  backgroundColor: '#ef4444', color: 'white', border: 'none', 
                  padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', 
                  fontWeight: '600', width: '100%', fontSize: '1rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                Entendi
              </button>
            </div>
          </div>
        )}
          <form onSubmit={handleSubmit}>
            
            {/* SESSÃO MÁGICA DA IA */}
            <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6d28d9', fontSize: '1rem', marginTop: 0, marginBottom: '10px' }}>
                <Sparkles size={18} /> Assistente de IA
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
                  style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', padding: '0 15px', borderRadius: '6px', cursor: isGerandoIA ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, opacity: isGerandoIA ? 0.7 : 1 }}
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
              <textarea name="corpoTexto" value={formData.corpoTexto} onChange={handleChange} className="input-field" rows="6" required />
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
              <button type="submit" className="btn-salvar-cadastro" disabled={isSalvando}>
                {isSalvando ? 'Processando...' : 'Criar Campanha'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}