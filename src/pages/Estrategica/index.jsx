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

export default function Estrategica() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isRelatorioOpen, setIsRelatorioOpen] = useState(false);
  const [periodoAtual, setPeriodoAtual] = useState('Mês Atual');
  const [mesRelatorio, setMesRelatorio] = useState('');
  const [anoRelatorio, setAnoRelatorio] = useState('');

  // ESTADOS DO FILTRO PERSONALIZADO
  const [dataInicioCustom, setDataInicioCustom] = useState('');
  const [dataFimCustom, setDataFimCustom] = useState('');
  const [triggerFetch, setTriggerFetch] = useState(0); // Gatilho para recarregar os dados

  // Estados Reais
  const [pagamentos, setPagamentos] = useState([]);
  const [produtosRentaveis, setProdutosRentaveis] = useState([]);
  const [margemCategoria, setMargemCategoria] = useState([]);
  const [sazonalidade, setSazonalidade] = useState([]); // Usaremos o faturamento histórico como volume
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
  // LÓGICA DE DATAS E INTEGRAÇÃO
  // ========================================================================
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const hoje = new Date();
        let inicio = new Date(hoje);
        let fim = new Date(hoje); // Criamos a variável fim

        if (periodoAtual === 'Esta Semana') {
          inicio.setDate(hoje.getDate() - hoje.getDay());
        } else if (periodoAtual === 'Mês Atual') {
          inicio.setDate(1);
        } else if (periodoAtual === 'Últimos 3 Meses') {
          inicio.setMonth(hoje.getMonth() - 3);
        } else if (periodoAtual === 'Personalizado') {
          // LÓGICA NOVA: Pega as datas do input
          if (dataInicioCustom) inicio = new Date(`${dataInicioCustom}T00:00:00`);
          if (dataFimCustom) fim = new Date(`${dataFimCustom}T23:59:59`);
        }

        // Zera as horas se não for personalizado (o personalizado já vem com a hora setada acima)
        if (periodoAtual !== 'Personalizado') {
          inicio.setHours(0, 0, 0, 0);
          fim.setHours(23, 59, 59, 999);
        }

        // Formata para o LocalDateTime do Spring
        const formatIso = (date) => {
          const pad = (n) => String(n).padStart(2, '0');
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };

        const filtroObj = { inicio: formatIso(inicio), fim: formatIso(fim) };

        // 2. Dispara requisições simultâneas para otimizar tempo
        const [resPag, resProd, resMargem, resSaz] = await Promise.all([
          KpiService.getDesempenhoPagamentos(filtroObj),
          KpiService.getProdutosRentaveis(filtroObj),
          KpiService.getMargemCategoria(filtroObj),
          KpiService.getGraficoFaturamentoDinamico({ ...filtroObj, tipo: "Mês" })
        ]);

        setPagamentos(resPag || []);
        setProdutosRentaveis(resProd || []);
        setMargemCategoria(resMargem || []);
        setSazonalidade(resSaz || []);

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
  const totalVendasQtd = pagamentos.reduce((acc, item) => acc + (item.qtdVendas || 0), 0);

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

      {/* ==========================================
          TOPO: FILTRO GLOBAL (LARGURA TOTAL)
          ========================================== */}
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

        {/* NOVA ÁREA DE AÇÕES COM O BOTÃO LOCAL */}
        <div className="estr-top-actions">
          <button 
            className="estr-btn-relatorio" 
            onClick={() => setIsRelatorioOpen(true)}
          >
            Emitir Relatório de Importação
          </button>
        </div>
      </div>

      {/* ==========================================
          LINHA 1: EFICIÊNCIA E PAGAMENTOS (Esquerda/Direita)
          ========================================== */}
      <div className="estr-row-1">

        {/* CARD ESQUERDA ACIMA: Sazonalidade do Produto (Volume) */}
        <div className="estr-card">
          <div className="estr-card-header">
            <h3>Sazonalidade de Vendas (Volume)</h3>
          </div>
          <div className="estr-card-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sazonalidade} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                <XAxis dataKey="periodo" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#718096' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#718096' }} tickFormatter={(val) => `R$${formatarNumero2Casas(val / 1000)}k`} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`R$ ${formatarNumero2Casas(value)}`, 'Volume de Vendas']}
                />
                <Bar dataKey="faturamento" name="Volume de Vendas" fill="#DCE4F2" radius={[4, 4, 0, 0]} barSize={40} />
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
                    {pagamentos.map((pag) => {
                      const frequencia = totalVendasQtd > 0 ? ((pag.qtdVendas / totalVendasQtd) * 100) : 0;
                      const valorMedio = pag.qtdVendas > 0 ? pag.valorTotal / pag.qtdVendas : 0;
                      const metodoEnum = (pag.metodo || "").toUpperCase();
                      return (
                        <tr key={pag.metodo}>
                          <td style={{ fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: CORES_PAGAMENTO[metodoEnum] || '#CBD5E0', marginRight: '8px' }}></span>
                            {formatarNomePagamento(pag.metodo)}
                          </td>
                          <td>{formatarNumero2Casas(frequencia)}%</td>
                          <td>{pag.qtdVendas}</td>
                          <td style={{ fontWeight: 'bold', color: '#2D3748' }}>{formatarMoeda2Casas(pag.valorTotal || 0)}</td>
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

      {/* ==========================================
          LINHA 2: MARGEM DE LUCRO E PRODUTOS RENTÁVEIS (Esquerda/Direita)
          ========================================== */}
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
                <XAxis dataKey="categoria" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#718096' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#FF70A6' }} tickFormatter={(val) => `${formatarNumero2Casas(val)}%`} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${formatarNumero2Casas(value)}%`, 'Margem Média']}
                />
                <Bar dataKey="margem" name="Margem Média" fill="#FF70A6" radius={[4, 4, 0, 0]} barSize={40} />
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
                      <td style={{ fontWeight: '600' }}>{prod.nome}</td>
                      <td>{prod.vendas} un.</td>
                      <td style={{ color: '#38A169', fontWeight: 'bold' }}>{formatarMoeda2Casas(prod.lucro || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          MODAL DE FILTRO 
          ========================================== */}
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

            {/* Renderiza os inputs de data apenas se "Personalizado" estiver selecionado */}
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