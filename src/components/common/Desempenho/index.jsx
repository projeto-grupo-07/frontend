import React, { useState, useEffect } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { KpiService } from "../../../services/KpiService"; // Ajuste o caminho se necessário
import './styles.css';

// ============================================================================
// 1. SUBCOMPONENTES LOCAIS
// ============================================================================

// Gráfico Combinado (Barra Azul Chumbo + Linha Rosa)
const Chart = ({ data, xKey, yKey }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{fill: '#A0AEC0', fontSize: 11, fontWeight: 'bold'}} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{fill: '#A0AEC0', fontSize: 11, fontWeight: 'bold'}} />
        <Tooltip cursor={{fill: '#EDF2F7'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} formatter={(value) => `R$ ${value}`} />
        
        {/* A Barra Azul Chumbo */}
        <Bar dataKey={yKey} fill="#5B6F8A" radius={[4, 4, 0, 0]} barSize={40} />
        
        {/* A Linha Rosa Curvada passando por cima */}
        <Line type="monotone" dataKey={yKey} stroke="#FF70A6" strokeWidth={3} dot={{r: 4, fill: "#FF70A6", strokeWidth: 2}} activeDot={{r: 6}} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

// Tabela Estilizada
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
             <tr><td colSpan={columns.length} style={{textAlign: 'center', color: '#a0aec0', padding: '20px'}}>Buscando dados...</td></tr>
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
  // --- Estados de Controle (Abas) ---
  const [metricFilter, setMetricFilter] = useState("Hoje");
  const [topProductsTab, setTopProductsTab] = useState("Produtos");
  const [revenueChartTab, setRevenueChartTab] = useState("Mensal");
  const [employeeTab, setEmployeeTab] = useState("Mensal");
  const [weekDayTab, setWeekDayTab] = useState("Atual");

  // --- Estados dos Dados ---
  const [kpiData, setKpiData] = useState({ revenue: 0, discount: 0, avgTicket: 0, totalSales: 0 });
  const [loadingKpis, setLoadingKpis] = useState(true);
  
  const [topProductsData, setTopProductsData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [weekData, setWeekData] = useState([]);

  // ==========================================================================
  // EFEITOS (BUSCA DE DADOS NA API)
  // ==========================================================================

  // 1. KPIs da Esquerda
  useEffect(() => {
    const fetchKpis = async () => {
      setLoadingKpis(true);
      try {
        let reqFat, reqDesc, reqVendas, reqTicket;

        if (metricFilter === "Hoje") {
          reqFat = KpiService.getFaturamentoDiario();
          reqDesc = KpiService.getDescontoDiario();
          reqVendas = KpiService.getUnidadesDiario(); 
          reqTicket = KpiService.getTicketMedioDiario();
        } else if (metricFilter === "Semana") {
          reqFat = KpiService.getFaturamentoSemanal();
          reqDesc = KpiService.getDescontoSemanal();
          reqVendas = KpiService.getUnidadesSemanal();
          reqTicket = KpiService.getTicketMedioSemanal();
        } else {
          reqFat = KpiService.getFaturamentoMensal();
          reqDesc = KpiService.getDescontoMensal();
          reqVendas = KpiService.getUnidadesMensal();
          reqTicket = KpiService.getTicketMedioMensal();
        }

        const [resFat, resDesc, resVendas, resTicket] = await Promise.all([reqFat, reqDesc, reqVendas, reqTicket]);

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
  }, [metricFilter]);

  // 2. Ranking Mais Vendidos (Com a Pílula Rosa no valor)
  useEffect(() => {
    const fetchTopRanking = async () => {
      try {
        const res = topProductsTab === "Produtos" 
          ? await KpiService.getRankingProdutosMes() 
          : await KpiService.getRankingMarcasMes();
        
        const formatted = (res || []).map((item, index) => ({
          "": <span className="ranking-badge">{index+1}</span>, 
          "Nome": <span style={{ fontWeight: 'bold', color: '#4a5568' }}>{item.nome}</span>,
          "Total (R$)": <span style={{ backgroundColor: '#FFE5F0', color: '#FF70A6', padding: '4px 12px', borderRadius: '16px', fontWeight: '900', fontSize: '12px' }}>{item.totalVendidas}</span>
        }));
        setTopProductsData(formatted);
      } catch (error) { console.error("Erro no Ranking:", error); }
    };
    fetchTopRanking();
  }, [topProductsTab]);

  // 3. Gráfico de Faturamento no Tempo
  useEffect(() => {
    const fetchRevenueTime = async () => {
      try {
        const res = revenueChartTab === "Mensal" 
          ? await KpiService.getGraficoFaturamentoMensal() 
          : await KpiService.getGraficoFaturamentoSemanal();
        
        const formatted = (res || []).map(item => ({
          "Período": item.mes ? `Mês ${item.mes}` : `Sem ${item.semana}`,
          "Faturamento": item.faturamentoTotal
        }));
        setRevenueData(formatted);
      } catch (error) { console.error("Erro no Gráfico de Tempo:", error); }
    };
    fetchRevenueTime();
  }, [revenueChartTab]);

  // 4. Tabela de Equipe (Desempenho Funcionários)
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = employeeTab === "Mensal"
          ? await KpiService.getDesempenhoEquipeMes()
          : await KpiService.getDesempenhoEquipeSemana();
        
        const formatted = (res || []).map(emp => ({
          "Nome": emp.vendedor,
          "Nº Vendas": emp.totalVendas,
          "Total R$": emp.totalFaturado.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}),
          "Comissão R$": emp.comissaoTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
        }));
        setEmployeeData(formatted);
      } catch (error) { console.error("Erro na Tabela de Equipe:", error); }
    };
    fetchTeam();
  }, [employeeTab]);

  // 5. Gráfico Dia da Semana Mais Movimentado
  useEffect(() => {
    const fetchPeakDay = async () => {
      try {
        const res = await KpiService.getGraficoPicoDia();
        const formatted = (res || []).map(item => ({
          "Dia": item.diaSemana.substring(0, 3), // "Seg", "Ter", etc.
          "Faturamento": item.faturamento
        }));
        setWeekData(formatted);
      } catch (error) { console.error("Erro no Pico por Dia:", error); }
    };
    fetchPeakDay();
  }, [weekDayTab]);

  // ==========================================================================
  // RENDERIZAÇÃO
  // ==========================================================================
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        
        {/* --- COLUNA ESQUERDA (Filtro e KPIs) --- */}
        <div className="left-column">
          
          <div className="period-toggle-large">
            {["Hoje", "Semana", "Mês"].map((f) => (
              <button
                key={f}
                className={metricFilter === f ? "active" : ""}
                onClick={() => setMetricFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="kpi-stack" style={{ opacity: loadingKpis ? 0.5 : 1, transition: 'opacity 0.3s' }}>
            
            <div className="kpi-card">
              <div className="kpi-header">Faturamento Bruto (R$) <span className="info-icon">!</span></div>
              <div className="kpi-body">{loadingKpis ? "..." : kpiData.revenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">Total em Descontos (R$) <span className="info-icon">!</span></div>
              <div className="kpi-body">{loadingKpis ? "..." : kpiData.discount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">Ticket Médio (R$) <span className="info-icon">!</span></div>
              <div className="kpi-body">{loadingKpis ? "..." : kpiData.avgTicket.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">Total de Vendas (Un) <span className="info-icon">!</span></div>
              <div className="kpi-body">{loadingKpis ? "..." : kpiData.totalSales}</div>
            </div>

          </div>
        </div>

        {/* --- COLUNA DIREITA (Gráficos e Tabelas) --- */}
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
                <span className="info-icon">!</span>
              </div>
            </div>
            <div className="card-body">
               <Table columns={["", "Nome", "Total (R$)"]} data={topProductsData} />
            </div>
          </div>

          {/* CARD 2: Faturamento ao Longo do Tempo */}
          <div className="content-card">
            <div className="card-header">
              <h3>Faturamento ao Longo do Tempo</h3>
              <div className="card-header-left">
                <div className="pill-tabs">
                    {["Mensal", "Semanal"].map(tab => (
                     <button key={tab} className={revenueChartTab === tab ? "active" : ""} onClick={() => setRevenueChartTab(tab)}>{tab}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="card-body">
              <Chart data={revenueData} xKey="Período" yKey="Faturamento" />
            </div>
          </div>

          {/* CARD 3: Desempenho Funcionários */}
          <div className="content-card">
            <div className="card-header">
              <h3>Desempenho Funcionários</h3>
              <div className="card-header-left">
                <div className="pill-tabs">
                   {["Mensal", "Semanal"].map(tab => (
                     <button key={tab} className={employeeTab === tab ? "active" : ""} onClick={() => setEmployeeTab(tab)}>{tab}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="card-body">
              <Table columns={["Nome", "Nº Vendas", "Total R$", "Comissão R$"]} data={employeeData} />
            </div>
          </div>

          {/* CARD 4: Dia da Semana Mais Movimentado */}
          <div className="content-card">
            <div className="card-header">
              <h3>Dia da Semana Mais Movimentado</h3>
              <div className="card-header-left">
                <div className="pill-tabs">
                   {["Atual", "Passada"].map(tab => (
                     <button key={tab} className={weekDayTab === tab ? "active" : ""} onClick={() => setWeekDayTab(tab)}>{tab}</button>
                  ))}
                </div>
                <span className="info-icon">!</span>
              </div>
            </div>
            <div className="card-body">
               <Chart data={weekData} xKey="Dia" yKey="Faturamento" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}