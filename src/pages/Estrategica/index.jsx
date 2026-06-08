import React, { useState, useEffect } from 'react';
import './styles.css';
import { FiFilter } from 'react-icons/fi';
import {
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { KpiService } from '../../services/KpiService';
import EmitirRelatorioModal from './EmitirRelatorioModal';
import api from '../../services/api/api';

const CORES_PAGAMENTO = {
  'PIX': '#10B981',       // Verde (Sem taxa)
  'DINHEIRO': '#059669',  // Verde escuro (Sem taxa)
  'DEBITO': '#3B82F6',    // Azul (Taxa média)
  'CREDITO': '#F43F5E',   // Vermelho (Alta taxa)
};

// Utilitário para formatar a string do ENUM que vem do Java
const formatarNomePagamento = (nomeCru) => {
  if (!nomeCru) return "-";
  const map = { 'CREDITO': 'Crédito', 'DEBITO': 'Débito', 'DINHEIRO': 'Dinheiro', 'PIX': 'PIX' };
  return map[nomeCru.toUpperCase()] || nomeCru;
};

const formatarNumero2Casas = (valor) =>
  Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatarMoeda2Casas = (valor) =>
  Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Extrai dados da resposta do Axios
const extractData = (res) => (res && res.data !== undefined ? res.data : res) || [];

export default function Estrategica() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isRelatorioOpen, setIsRelatorioOpen] = useState(false);
  const [periodoAtual, setPeriodoAtual] = useState('Mês Atual');
  const [mesRelatorio, setMesRelatorio] = useState('');
  const [anoRelatorio, setAnoRelatorio] = useState('');

  // ESTADOS DO FILTRO PERSONALIZADO
  const [dataInicioCustom, setDataInicioCustom] = useState('');
  const [dataFimCustom, setDataFimCustom] = useState('');
  const [triggerFetch, setTriggerFetch] = useState(0); 

  // Estados Reais
  const [pagamentos, setPagamentos] = useState([]);
  const [produtosRentaveis, setProdutosRentaveis] = useState([]);
  const [margemCategoria, setMargemCategoria] = useState([]);
  const [sazonalidade, setSazonalidade] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [isSubmittingRelatorio, setIsSubmittingRelatorio] = useState(false);

  useEffect(() => {
    document.title = "Estratégica | Brink Calçados";
  }, []);
  
  useEffect(() => {
    if (!isRelatorioOpen) return;
    const hoje = new Date();
    setMesRelatorio(String(hoje.getMonth() + 1));
    setAnoRelatorio(String(hoje.getFullYear()));
  }, [isRelatorioOpen]);

  // ========================================================================
  // LÓGICA DE DATAS E INTEGRAÇÃO (ATUALIZADO PARA O NOVO BACKEND)
  // ========================================================================
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        let tipoBackend = periodoAtual;
        let inicioIso = null;
        let fimIso = null;

        // Formata data JS para LocalDateTime do Java
        const formatIso = (date) => {
          const pad = (n) => String(n).padStart(2, '0');
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };

        // De/Para do menu do usuário para o padrão do backend
        if (periodoAtual === 'Mês Atual') {
            tipoBackend = 'Este Mês';
        } else if (periodoAtual === 'Últimos 3 Meses') {
            tipoBackend = 'Personalizado';
            const hoje = new Date();
            const tresMesesAtras = new Date();
            tresMesesAtras.setMonth(hoje.getMonth() - 3);
            tresMesesAtras.setHours(0, 0, 0, 0);
            hoje.setHours(23, 59, 59, 999);
            inicioIso = formatIso(tresMesesAtras);
            fimIso = formatIso(hoje);
        } else if (periodoAtual === 'Personalizado') {
            inicioIso = dataInicioCustom ? `${dataInicioCustom}T00:00:00` : null;
            fimIso = dataFimCustom ? `${dataFimCustom}T23:59:59` : null;
        }

        const filtroObj = { tipo: tipoBackend, inicio: inicioIso, fim: fimIso };

        // Dispara requisições simultâneas para otimizar tempo
        const [resPag, resProd, resMargem, resSaz] = await Promise.all([
          KpiService.getDesempenhoPagamentos(filtroObj),
          KpiService.getProdutosRentaveis(filtroObj),
          KpiService.getMargemCategoria(filtroObj),
          // MODIFICAÇÃO 1: Chamando o novo endpoint de Volume!
          KpiService.getGraficoVolumeDinamico(filtroObj) 
        ]);

        // Seta os estados extraindo a .data do Axios
        setPagamentos(extractData(resPag));
        setProdutosRentaveis(extractData(resProd));
        setMargemCategoria(extractData(resMargem));
        setSazonalidade(extractData(resSaz));

      } catch (error) {
        console.error("Erro ao buscar dados estratégicos", error);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [periodoAtual, triggerFetch]);

  // ========================================================================
  // CÁLCULOS DINÂMICOS
  // ========================================================================
  const totalVendasQtd = pagamentos.reduce((acc, item) => acc + (item.qtdVendas || item.QtdVendas || 0), 0);

  const handleGerarRelatorio = (event) => {
    event.preventDefault();
    (async () => {
      setIsSubmittingRelatorio(true);
      try {
        const mesParaEnviar = mesRelatorio ? String(Number(mesRelatorio)) : mesRelatorio;
        console.log('Relatório solicitado', { mes: mesParaEnviar, ano: anoRelatorio });

        const resultado = await api.post("/relatorio/gerar", {
          ano: anoRelatorio,
          mes: mesParaEnviar
        }, { responseType: 'arraybuffer', timeout: 150000 });

        let arrayBuffer = null;
        if (resultado instanceof ArrayBuffer || (resultado && resultado.byteLength !== undefined)) {
          arrayBuffer = resultado;
        } else if (resultado && typeof resultado === 'object' && typeof resultado.data === 'string') {
          const base64 = resultado.data;
          const binary = window.atob(base64);
          const len = binary.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
          arrayBuffer = bytes.buffer;
        } else if (typeof resultado === 'string') {
          let base64 = resultado;
          const idx = resultado.indexOf('base64,');
          if (idx !== -1) base64 = resultado.slice(idx + 7);
          try {
            const binary = window.atob(base64);
            const len = binary.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
            arrayBuffer = bytes.buffer;
          } catch (e) {
            arrayBuffer = new TextEncoder().encode(resultado).buffer;
          }
        }

        if (arrayBuffer) {
          const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const nomeArquivo = `relatorio_${anoRelatorio || 'anonimo'}_${mesParaEnviar || 'todos'}.pdf`;
          a.download = nomeArquivo;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);

          alert('Relatório gerado e baixado com sucesso.');
          setIsRelatorioOpen(false);
        } else {
          console.warn('Resposta do relatório não pôde ser interpretada como PDF:', resultado);
          alert('Relatório emitido, mas formato da resposta não é um PDF. Verifique o console.');
        }
      } catch (error) {
        console.error('Erro ao solicitar relatório:', error);
        alert('Erro ao emitir relatório. Tente novamente.');
      } finally {
        setIsSubmittingRelatorio(false);
      }
    })();
  };

  return (
    <div className="estrategica-wrapper">

      {/* TOPO: FILTRO GLOBAL */}
      <div className="estr-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-icon-filtro" onClick={() => setIsFilterOpen(true)} title="Filtrar Período">
            <FiFilter size={22} color="#FF70A6" />
          </button>
          <div>
            <h2 style={{ margin: 0, color: '#2D3748', fontSize: '22px', fontWeight: '900' }}>Visão Estratégica & Lucratividade</h2>
            <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '13px' }}>
              Foco em eficiência operacional e margem real. Período: <strong style={{ color: '#FF70A6' }}>{periodoAtual}</strong>
            </p>
          </div>
        </div>

        <div className="estr-top-actions">
          <button 
            className="estr-btn-relatorio" 
            onClick={() => setIsRelatorioOpen(true)}
          >
            Emitir Relatório de Importação
          </button>
        </div>
      </div>

      <div className="estr-row-1">

        {/* CARD ESQUERDA ACIMA: Sazonalidade de Vendas (Volume) */}
        <div className="estr-card">
          <div className="estr-card-header">
            <h3>Sazonalidade de Vendas (Volume)</h3>
          </div>
          <div className="estr-card-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sazonalidade} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                <XAxis dataKey="periodo" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#718096' }} />
                
                {/* MODIFICAÇÃO 2: Removida a máscara de R$ e a divisão por mil (k) do YAxis */}
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#718096' }} 
                    tickFormatter={(val) => Math.floor(val)} 
                />
                
                {/* MODIFICAÇÃO 3: Ajustada a formatação da Tooltip (caixinha preta ao passar o mouse) */}
                <RechartsTooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value} vendas`, 'Volume']}
                />
                
                {/* MODIFICAÇÃO 4: A dataKey agora busca "volume" em vez de "faturamento" */}
                <Bar dataKey={(row) => row.volume || row.Volume} name="Volume de Vendas" fill="#DCE4F2" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARD DIREITA ACIMA: Métodos de Pagamento */}
        <div className="estr-card">
          <div className="estr-card-header">
            <h3>Desempenho por Método de Pagamento</h3>
          </div>
          <div className="estr-card-body" style={{ display: 'flex', flexDirection: 'column' }}>
            {loading ? <div style={{ color: '#a0aec0', padding: '10px' }}>Carregando métricas...</div> : (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <table className="estr-table">
                  <thead>
                    <tr>
                      <th>Método</th>
                      <th>Uso (%)</th>
                      <th>Qtd. Vendas</th>
                      <th>Valor Total</th>
                      <th>Ticket Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagamentos.map((pag, idx) => {
                      const metodoCru = pag.metodo || pag.Metodo || "";
                      const qtdVendas = pag.qtdVendas || pag.QtdVendas || 0;
                      const valorTotal = pag.valorTotal || pag.ValorTotal || 0;
                      
                      const frequencia = totalVendasQtd > 0 ? ((qtdVendas / totalVendasQtd) * 100) : 0;
                      const valorMedio = qtdVendas > 0 ? valorTotal / qtdVendas : 0;
                      const metodoEnum = metodoCru.toUpperCase();
                      
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: CORES_PAGAMENTO[metodoEnum] || '#CBD5E0', marginRight: '8px' }}></span>
                            {formatarNomePagamento(metodoCru)}
                          </td>
                          <td>{formatarNumero2Casas(frequencia)}%</td>
                          <td>{qtdVendas}</td>
                          <td style={{ fontWeight: 'bold', color: '#2D3748' }}>{formatarMoeda2Casas(valorTotal)}</td>
                          <td>{formatarMoeda2Casas(valorMedio)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="estr-row-2">

        {/* CARD ESQUERDA ABAIXO: Gráfico de Margem de Lucro */}
        <div className="estr-card">
          <div className="estr-card-header">
            <h3>Margem de Lucro por Categoria</h3>
          </div>
          <div className="estr-card-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={margemCategoria} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                <XAxis dataKey={row => row.categoria || row.Categoria} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#718096' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#FF70A6' }} tickFormatter={(val) => `${formatarNumero2Casas(val)}%`} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${formatarNumero2Casas(value)}%`, 'Margem Média']}
                />
                <Bar dataKey={row => row.margem || row.Margem} name="Margem Média" fill="#FF70A6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARD DIREITA ABAIXO: Tabela de Produtos Mais Rentáveis */}
        <div className="estr-card">
          <div className="estr-card-header">
            <h3>Produtos Mais Rentáveis</h3>
          </div>
          <div className="estr-card-body" style={{ overflowY: 'auto' }}>
            {loading ? <div style={{ color: '#a0aec0', padding: '10px' }}>Mapeando produtos...</div> : (
              <table className="estr-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtd. Vendas</th>
                    <th>Lucro Líquido</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosRentaveis.map((prod, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{prod.nome || prod.Nome}</td>
                      <td>{prod.vendas || prod.Vendas} un.</td>
                      <td style={{ color: '#38A169', fontWeight: 'bold' }}>{formatarMoeda2Casas(prod.lucro || prod.Lucro || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE FILTRO */}
      {isFilterOpen && (
        <div className="estr-modal-overlay">
          <div className="estr-modal-content">
            <h3 style={{ margin: '0 0 20px 0', color: '#2D3748', fontSize: '18px', fontWeight: '800' }}>Filtrar Período</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Hoje', 'Esta Semana', 'Mês Atual', 'Últimos 3 Meses', 'Personalizado'].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriodoAtual(p);
                    if (p !== 'Personalizado') {
                      setIsFilterOpen(false);
                    }
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: p === periodoAtual ? '2px solid #FF70A6' : '1px solid #E2E8F0',
                    backgroundColor: p === periodoAtual ? '#FFE5F0' : '#FFF',
                    color: p === periodoAtual ? '#D53F8C' : '#4A5568',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {periodoAtual === 'Personalizado' && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', backgroundColor: '#F7FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', color: '#4A5568', fontWeight: 'bold', marginBottom: '4px' }}>Data Inicial</label>
                  <input
                    type="date"
                    value={dataInicioCustom}
                    onChange={(e) => setDataInicioCustom(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E0', color: '#2D3748', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', color: '#4A5568', fontWeight: 'bold', marginBottom: '4px' }}>Data Final</label>
                  <input
                    type="date"
                    value={dataFimCustom}
                    onChange={(e) => setDataFimCustom(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E0', color: '#2D3748', outline: 'none' }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsFilterOpen(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#EDF2F7',
                  color: '#4A5568',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>

              {periodoAtual === 'Personalizado' && (
                <button
                  onClick={() => {
                    setIsFilterOpen(false);
                    setTriggerFetch(prev => prev + 1);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#FF70A6',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Aplicar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <EmitirRelatorioModal
        isOpen={isRelatorioOpen}
        mes={mesRelatorio}
        ano={anoRelatorio}
        onChangeMes={setMesRelatorio}
        onChangeAno={setAnoRelatorio}
        onClose={() => setIsRelatorioOpen(false)}
        onSubmit={handleGerarRelatorio}
        isSubmitting={isSubmittingRelatorio}
      />

    </div>
  );
}