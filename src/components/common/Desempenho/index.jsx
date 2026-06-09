import React, { useState, useEffect } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FiMaximize2, FiX } from "react-icons/fi"; // <-- IMPORTADOS OS ÍCONES
import { KpiService } from "../../../services/KpiService";
import FiltroPeriodoModal from "../FiltroPeriodoModal"; 
import './styles.css';

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

// ============================================================================
// 1. SUBCOMPONENTES LOCAIS
// ============================================================================

const Chart = ({ data, xKey, yKey }) => {
  // NOVO ESTADO: Objeto com o status (ligado/desligado) de cada elemento visual
  const [visuais, setVisuais] = useState({
    barras: true,
    linha: true,
    pontos: true
  });

  // Função helper para inverter o estado do botão clicado
  const toggleVisual = (chave) => {
    setVisuais((prev) => ({
      ...prev,
      [chave]: !prev[chave]
    }));
  };

  // DEFESA: Se não houver dados
  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0', fontSize: '14px', fontStyle: 'italic', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
        Nenhuma venda registrada neste período.
      </div>
    );
  }

  // Verifica se precisa renderizar o componente <Line> (só renderiza se linha OU pontos estiverem ativos)
  const renderizarLinha = visuais.linha || visuais.pontos;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* MINI-TOOLBAR: Botões Independentes (Toggles) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <div className="pill-tabs" style={{ transform: 'scale(0.85)', transformOrigin: 'right top' }}>
          <button 
            className={visuais.barras ? 'active' : ''} 
            onClick={() => toggleVisual('barras')}
          >
            Barras
          </button>
          <button 
            className={visuais.linha ? 'active' : ''} 
            onClick={() => toggleVisual('linha')}
          >
            Linha
          </button>
          <button 
            className={visuais.pontos ? 'active' : ''} 
            onClick={() => toggleVisual('pontos')}
          >
            Pontos
          </button>
        </div>
      </div>

      {/* ÁREA DO GRÁFICO */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: '#2D3748', fontSize: 14, fontWeight: '700' }} dy={12} />
            <YAxis width={90} axisLine={false} tickLine={false} tick={{ fill: '#2D3748', fontSize: 14, fontWeight: '700' }} tickFormatter={(value) => formatarNumero2Casas(value)} />
            
            <Tooltip
              cursor={{ fill: '#EDF2F7' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }}
              labelStyle={{ fontSize: 13, fontWeight: 800, color: '#2D3748' }}
              itemStyle={{ fontSize: 13, color: '#2D3748', fontWeight: 700 }}
              formatter={(value) => `R$ ${formatarNumero2Casas(value)}`}
            />

            {/* RENDERIZAÇÃO CONDICIONAL: A barra só existe se visuais.barras for true */}
            {visuais.barras && (
              <Bar dataKey={yKey} fill="#5B6F8A" radius={[6, 6, 0, 0]} barSize={48} />
            )}
            
            {/* RENDERIZAÇÃO CONDICIONAL DA LINHA E DOS PONTOS */}
            {renderizarLinha && (
              <Line 
                type="monotone" 
                dataKey={yKey} 
                stroke={visuais.linha ? "#FF70A6" : "transparent"} 
                strokeWidth={3} 
                dot={visuais.pontos ? { r: 5, fill: "#FF70A6", strokeWidth: 2 } : false} 
                activeDot={visuais.pontos ? { r: 7 } : false} 
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Table = ({ columns, data }) => {
  return (
    <div style={{ width: '100%', height: '100%', overflowX: 'auto' }}>
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map(col => <th key={col}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, idx) => (
              <tr key={idx}>
                {columns.map(col => <td key={col}>{row[col]}</td>)}
              </tr>
            ))
          ) : (
            <tr><td colSpan={columns.length} style={{ textAlign: 'center', color: '#a0aec0', padding: '20px' }}>Nenhum registro encontrado...</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// 2. COMPONENTE PRINCIPAL (DASHBOARD)
// ============================================================================

export default function Dashboard() {
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [filtroPeriodo, setFiltroPeriodo] = useState({ tipo: "Este Mês", inicio: null, fim: null });
  const [topProductsTab, setTopProductsTab] = useState("Produtos");

  // --- NOVO ESTADO: Controla qual gráfico está aberto no Modal Fullscreen ---
  const [graficoExpandido, setGraficoExpandido] = useState(null);

  const [kpiData, setKpiData] = useState({ revenue: 0, discount: 0, avgTicket: 0, totalSales: 0 });
  const [loadingKpis, setLoadingKpis] = useState(true);

  const [topProductsData, setTopProductsData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [weekData, setWeekData] = useState([]);

  useEffect(() => {
    document.title = "Desempenho | Brink Calçados";
  }, []);

  // 1. KPIs da Esquerda
  useEffect(() => {
    const fetchKpis = async () => {
      setLoadingKpis(true);
      try {
        const [resFat, resDesc, resVendas, resTicket] = await Promise.all([
          KpiService.getFaturamento(filtroPeriodo),
          KpiService.getTotalDescontos(filtroPeriodo),
          KpiService.getTotalVendas(filtroPeriodo),
          KpiService.getTicketMedio(filtroPeriodo)
        ]);

        setKpiData({
          revenue: Number(resFat) || 0,
          discount: Number(resDesc) || 0,
          totalSales: Number(resVendas) || 0,
          avgTicket: Number(resTicket) || 0
        });
      } catch (error) {
        console.error("Erro ao buscar KPIs:", error);
      } finally {
        setLoadingKpis(false);
      }
    };
    fetchKpis();
  }, [filtroPeriodo]);

  // 2. Ranking Dinâmico
  useEffect(() => {
    const fetchTopRanking = async () => {
      try {
        const res = topProductsTab === "Produtos"
          ? await KpiService.getRankingProdutosDinamico(filtroPeriodo)
          : await KpiService.getRankingMarcasDinamico(filtroPeriodo);

        const formatted = (res || []).map((item, index) => ({
          "": <span className="ranking-badge">{index + 1}</span>,
          "Nome": <span style={{ fontWeight: 'bold', color: '#4a5568' }}>{item.nome || item.Nome || "-"}</span>,
          "Total (Un)": <span style={{ backgroundColor: '#FFE5F0', color: '#FF70A6', padding: '4px 12px', borderRadius: '16px', fontWeight: '900', fontSize: '12px' }}>{item.totalVendidas || item.TotalVendidas || 0}</span>
        }));
        setTopProductsData(formatted);
      } catch (error) { console.error("Erro no Ranking:", error); }
    };
    fetchTopRanking();
  }, [topProductsTab, filtroPeriodo]);

  // 3. Gráfico Faturamento Dinâmico
  useEffect(() => {
    const fetchRevenueTime = async () => {
      try {
        const res = await KpiService.getGraficoFaturamentoDinamico(filtroPeriodo);
        const formatted = (res || []).map(item => ({
          "Período": item.periodo || item.Periodo || "S/D",
          "Faturamento": Number(item.faturamento || item.Faturamento || 0)
        }));
        setRevenueData(formatted);
      } catch (error) { console.error("Erro no Gráfico de Tempo:", error); }
    };
    fetchRevenueTime();
  }, [filtroPeriodo]);

  // 4. Desempenho Equipe Dinâmico
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await KpiService.getDesempenhoEquipeDinamico(filtroPeriodo);
        const formatted = (res || []).map(emp => ({
          "Nome": emp.vendedor || emp.Vendedor || "Desconhecido",
          "Nº Vendas": emp.totalVendas || emp.TotalVendas || 0,
          "Total R$": formatarMoeda2Casas(emp.totalFaturado || emp.TotalFaturado || 0),
          "Comissão R$": formatarMoeda2Casas(emp.comissaoTotal || emp.ComissaoTotal || 0)
        }));
        setEmployeeData(formatted);
      } catch (error) { console.error("Erro na Tabela de Equipe:", error); }
    };
    fetchTeam();
  }, [filtroPeriodo]);

  // 5. Gráfico Dia da Semana Dinâmico
  useEffect(() => {
    const fetchPeakDay = async () => {
      try {
        const res = await KpiService.getGraficoPicoDiaDinamico(filtroPeriodo);
        const dataArr = res && res.data ? res.data : (res || []);
        const formatted = dataArr.map(item => ({
          "Dia": (item.diaSemana || item.DiaSemana || "").substring(0, 3),
          "Faturamento": Number(item.faturamento || item.Faturamento || 0)
        }));
        setWeekData(formatted);
      } catch (error) { 
        console.error("Erro no Pico por Dia:", error); 
      }
    };
    fetchPeakDay();
  }, [filtroPeriodo]);

  const textoBotaoFiltro = filtroPeriodo.tipo === "Personalizado"
    ? `${filtroPeriodo.inicio.split('-').reverse().join('/')} até ${filtroPeriodo.fim.split('-').reverse().join('/')}`
    : filtroPeriodo.tipo;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">

        <div className="left-column">
          <button className="btn-filtro-global" onClick={() => setModalFiltroAberto(true)}>
            <span style={{ fontSize: '18px' }}>📅</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', color: '#718096', fontWeight: 'bold', textTransform: 'uppercase' }}>Período Atual</span>
              <span style={{ fontSize: '14px', color: '#d53f8c', fontWeight: '900' }}>{textoBotaoFiltro}</span>
            </div>
          </button>

          <div className="kpi-stack" style={{ opacity: loadingKpis ? 0.5 : 1, transition: 'opacity 0.3s' }}>
            <div className="kpi-card"><div className="kpi-header">Faturamento Bruto (R$)</div><div className="kpi-body">{loadingKpis ? "..." : formatarNumero2Casas(kpiData.revenue)}</div></div>
            <div className="kpi-card"><div className="kpi-header">Total em Descontos (R$)</div><div className="kpi-body">{loadingKpis ? "..." : formatarNumero2Casas(kpiData.discount)}</div></div>
            <div className="kpi-card"><div className="kpi-header">Ticket Médio (R$)</div><div className="kpi-body">{loadingKpis ? "..." : formatarNumero2Casas(kpiData.avgTicket)}</div></div>
            <div className="kpi-card"><div className="kpi-header">Total de Vendas (Un)</div><div className="kpi-body">{loadingKpis ? "..." : kpiData.totalSales}</div></div>
          </div>
        </div>

        <div className="main-content-grid">

          {/* CARD 1: Mais Vendidos */}
          <div className="content-card">
            <div className="card-header">
              <h3>Mais Vendidos</h3>
              <div className="card-header-left">
                <div className="pill-tabs">
                  {["Produtos", "Marcas"].map(tab => (
                    <button key={tab} className={topProductsTab === tab ? "active" : ""} onClick={() => setTopProductsTab(tab)}>{tab}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="card-body">
              <Table columns={["", "Nome", "Total (Un)"]} data={topProductsData} />
            </div>
          </div>

          {/* CARD 2: Faturamento Histórico (COM BOTÃO EXPANDIR) */}
          <div className="content-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Faturamento Histórico</h3>
              <button 
                onClick={() => setGraficoExpandido({ title: 'Faturamento Histórico', data: revenueData, xKey: 'Período', yKey: 'Faturamento' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', padding: '4px' }}
                title="Expandir Gráfico"
              >
                <FiMaximize2 size={20} />
              </button>
            </div>
            <div className="card-body">
              <Chart data={revenueData} xKey="Período" yKey="Faturamento" />
            </div>
          </div>

          {/* CARD 3: Desempenho Funcionários */}
          <div className="content-card">
            <div className="card-header">
              <h3>Desempenho Funcionários</h3>
            </div>
            <div className="card-body">
              <Table columns={["Nome", "Nº Vendas", "Total R$", "Comissão R$"]} data={employeeData} />
            </div>
          </div>

          {/* CARD 4: Distribuição por Dia (COM BOTÃO EXPANDIR) */}
          <div className="content-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Distribuição por Dia</h3>
              <button 
                onClick={() => setGraficoExpandido({ title: 'Distribuição por Dia', data: weekData, xKey: 'Dia', yKey: 'Faturamento' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', padding: '4px' }}
                title="Expandir Gráfico"
              >
                <FiMaximize2 size={20} />
              </button>
            </div>
            <div className="card-body">
              <Chart data={weekData} xKey="Dia" yKey="Faturamento" />
            </div>
          </div>

        </div>
      </div>

      {/* =====================================================================
          MODAL FULLSCREEN DE EXPANSÃO DE GRÁFICO 
          ===================================================================== */}
      {graficoExpandido && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)', // Fundo escuro levemente translúcido
          zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', 
            width: '100%', maxWidth: '1400px', height: '90%', // Ocupa a tela quase inteira
            display: 'flex', flexDirection: 'column', padding: '24px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Cabeçalho do Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: '800' }}>
                {graficoExpandido.title}
              </h2>
              <button 
                onClick={() => setGraficoExpandido(null)} 
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#64748b', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
              >
                <FiX size={24} />
              </button>
            </div>
            
            {/* Corpo do Modal (O Gráfico Reutilizado esticando ao máximo) */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <Chart 
                data={graficoExpandido.data} 
                xKey={graficoExpandido.xKey} 
                yKey={graficoExpandido.yKey} 
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FILTRO */}
      <FiltroPeriodoModal
        show={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        filtroAtual={filtroPeriodo}
        onApply={(novoFiltro) => setFiltroPeriodo(novoFiltro)}
      />

    </div>
  );
}