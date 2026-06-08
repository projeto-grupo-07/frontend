import React, { useState, useEffect } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { KpiService } from "../../../services/KpiService";
import FiltroPeriodoModal from "../FiltroPeriodoModal"; // Ajuste o caminho se necessário
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
  // DEFESA: Se não houver dados, mostra mensagem elegante em vez de bugar a tela
  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0', fontSize: '14px', fontStyle: 'italic', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
        Nenhuma venda registrada neste período.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* 1. MUDANÇA AQUI: Alterado o left de -20 para 10 (ou 20) para não cortar o SVG */}
      <ComposedChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        
        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: '#2D3748', fontSize: 14, fontWeight: '700' }} dy={12} />
        
        {/* 2. MUDANÇA AQUI: Adicionado width={90} (ou 100) para garantir espaço para os números grandes */}
        <YAxis 
          width={90} 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#2D3748', fontSize: 14, fontWeight: '700' }} 
          tickFormatter={(value) => formatarNumero2Casas(value)} 
        />
        
        <Tooltip
          cursor={{ fill: '#EDF2F7' }}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }}
          labelStyle={{ fontSize: 13, fontWeight: 800, color: '#2D3748' }}
          itemStyle={{ fontSize: 13, color: '#2D3748', fontWeight: 700 }}
          formatter={(value) => `R$ ${formatarNumero2Casas(value)}`}
        />

        <Bar dataKey={yKey} fill="#5B6F8A" radius={[6, 6, 0, 0]} barSize={48} />
        <Line type="monotone" dataKey={yKey} stroke="#FF70A6" strokeWidth={3} dot={{ r: 5, fill: "#FF70A6", strokeWidth: 2 }} activeDot={{ r: 7 }} />
      </ComposedChart>
    </ResponsiveContainer>
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
  // --- Estados do Filtro Global ---
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [filtroPeriodo, setFiltroPeriodo] = useState({ tipo: "Este Mês", inicio: null, fim: null });

  const [topProductsTab, setTopProductsTab] = useState("Produtos");

  // --- Estados dos Dados ---
  const [kpiData, setKpiData] = useState({ revenue: 0, discount: 0, avgTicket: 0, totalSales: 0 });
  const [loadingKpis, setLoadingKpis] = useState(true);

  const [topProductsData, setTopProductsData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [weekData, setWeekData] = useState([]);

  
  useEffect(() => {

        document.title = "Desempenho | Brink Calçados";
    }, []);

  // ==========================================================================
  // EFEITOS (BUSCA DE DADOS NA API)
  // ==========================================================================

  // 1. KPIs da Esquerda
// 1. KPIs da Esquerda (Substitua todo o seu useEffect antigo do fetchKpis por este)
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

  // 2. Ranking Dinâmico (Produtos / Marcas)
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

        const formatted = (res || []).map(item => ({
          "Dia": (item.diaSemana || item.DiaSemana || "").substring(0, 3),
          "Faturamento": Number(item.faturamento || item.Faturamento || 0)
        }));
        setWeekData(formatted);
      } catch (error) { console.error("Erro no Pico por Dia:", error); }
    };
    fetchPeakDay();
  }, [filtroPeriodo]);

  // 5. Gráfico Dia da Semana Dinâmico
  useEffect(() => {
    const fetchPeakDay = async () => {
      try {
        const res = await KpiService.getGraficoPicoDiaDinamico(filtroPeriodo);
        
        // Garante que pega o array correto do Axios
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

  // Formata o texto do botão de filtro
  const textoBotaoFiltro = filtroPeriodo.tipo === "Personalizado"
    ? `${filtroPeriodo.inicio.split('-').reverse().join('/')} até ${filtroPeriodo.fim.split('-').reverse().join('/')}`
    : filtroPeriodo.tipo;

  // ==========================================================================
  // RENDERIZAÇÃO
  // ==========================================================================
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">

        {/* --- COLUNA ESQUERDA --- */}
        <div className="left-column">

          <button className="btn-filtro-global" onClick={() => setModalFiltroAberto(true)}>
            <span style={{ fontSize: '18px' }}>📅</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', color: '#718096', fontWeight: 'bold', textTransform: 'uppercase' }}>Período Atual</span>
              <span style={{ fontSize: '14px', color: '#d53f8c', fontWeight: '900' }}>{textoBotaoFiltro}</span>
            </div>
          </button>

          <div className="kpi-stack" style={{ opacity: loadingKpis ? 0.5 : 1, transition: 'opacity 0.3s' }}>

            <div className="kpi-card">
              <div className="kpi-header">Faturamento Bruto (R$)</div>
              <div className="kpi-body">{loadingKpis ? "..." : formatarNumero2Casas(kpiData.revenue)}</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">Total em Descontos (R$)</div>
              <div className="kpi-body">{loadingKpis ? "..." : formatarNumero2Casas(kpiData.discount)}</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">Ticket Médio (R$)</div>
              <div className="kpi-body">{loadingKpis ? "..." : formatarNumero2Casas(kpiData.avgTicket)}</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">Total de Vendas (Un)</div>
              <div className="kpi-body">{loadingKpis ? "..." : kpiData.totalSales}</div>
            </div>

          </div>
        </div>

        {/* --- COLUNA DIREITA --- */}
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

          {/* CARD 2: Faturamento Histórico */}
          <div className="content-card">
            <div className="card-header">
              <h3>Faturamento Histórico</h3>
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

          {/* CARD 4: Distribuição por Dia */}
          <div className="content-card">
            <div className="card-header">
              <h3>Distribuição por Dia</h3>
            </div>
            <div className="card-body">
              <Chart data={weekData} xKey="Dia" yKey="Faturamento" />
            </div>
          </div>

        </div>
      </div>

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