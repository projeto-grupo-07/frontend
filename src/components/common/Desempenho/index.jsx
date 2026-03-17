import React, { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { KpiService } from "../../../services/KpiService"; // Ajuste o caminho se necessário
import './styles.css';

// ============================================================================
// 1. SUBCOMPONENTES LOCAIS
// ============================================================================
const Chart = ({ type, data, xKey, yKey, color = "#8884d8" }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {type === "bar" ? (
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} />
          <Tooltip cursor={{fill: '#EDF2F7'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} formatter={(value) => `R$ ${value}`} />
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      ) : (
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} />
          <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} formatter={(value) => `R$ ${value}`} />
          <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
};

const Table = ({ columns, data }) => {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
            {columns.map(col => (
              <th key={col} style={{ padding: '12px 8px', color: '#4A5568', fontSize: '14px', fontWeight: '600' }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #EDF2F7', transition: 'background-color 0.2s' }}>
                {columns.map(col => (
                  <td key={col} style={{ padding: '12px 8px', color: '#2D3748', fontSize: '14px' }}>{row[col]}</td>
                ))}
              </tr>
            ))
          ) : (
             <tr><td colSpan={columns.length} style={{textAlign: 'center', padding: '12px', color: '#a0aec0'}}>Carregando ou sem dados...</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// 2. COMPONENTE PRINCIPAL (DASHBOARD) LIGADO À API
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
  // EFEITOS (BUSCA DE DADOS)
  // ==========================================================================

  // 1. KPIs da Esquerda (Faturamento, Desconto, Ticket, Vendas)
  useEffect(() => {
    const fetchKpis = async () => {
      setLoadingKpis(true);
      try {
        let reqFat, reqDesc, reqVendas, reqTicket;

        if (metricFilter === "Hoje") {
          reqFat = KpiService.getFaturamentoDiario();
          reqDesc = KpiService.getDescontoDiario();
          reqVendas = KpiService.getUnidadesDiario(); // Alterado para buscar unidades
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

  // 2. Ranking Mais Vendidos (Produtos ou Marcas)
  useEffect(() => {
    const fetchTopRanking = async () => {
      try {
        const res = topProductsTab === "Produtos" 
          ? await KpiService.getRankingProdutosMes() 
          : await KpiService.getRankingMarcasMes();
        
        // Formata para a tabela entender
        const formatted = (res || []).map((item, index) => ({
          "": <span style={{ backgroundColor: '#2b6cb0', color: '#fff', padding: '2px 8px', borderRadius: '50%', fontSize: '12px', fontWeight: 'bold' }}>{index+1}</span>, 
          "Nome": <span style={{ fontWeight: 'bold', color: '#4a5568' }}>{item.nome}</span>,
          "Qtd (Un)": <span style={{ color: '#38a169', fontWeight: 'bold' }}>{item.totalVendidas}</span>
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
        
        // Formata para o Recharts (Ex: "Mês 3" ou "Semana 12")
        const formatted = (res || []).map(item => ({
          "Período": item.mes ? `Mês ${item.mes}` : `Sem ${item.semana}`,
          "Faturamento": item.faturamentoTotal
        }));
        setRevenueData(formatted);
      } catch (error) { console.error("Erro no Gráfico de Tempo:", error); }
    };
    fetchRevenueTime();
  }, [revenueChartTab]);

  // 4. Tabela de Equipe (Desempenho Vendedores)
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

  // 5. Gráfico Pico por Dia (Semana Atual)
  useEffect(() => {
    const fetchPeakDay = async () => {
      try {
        const res = await KpiService.getGraficoPicoDia(); // Atualmente só temos a semana atual mapeada no backend
        const formatted = (res || []).map(item => ({
          "Dia": item.diaSemana.substring(0, 3), // Pega "Seg", "Ter", etc.
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
    <div className="dashboard-wrapper" style={{ backgroundColor: '#fef2f7', minHeight: '100vh', padding: '20px' }}>
      <div className="dashboard-container" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* --- COLUNA ESQUERDA (Filtro e KPIs) --- */}
        <div className="left-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="period-toggle-large" style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '12px', padding: '6px' }}>
            {["Hoje", "Semana", "Mês"].map((f) => (
              <button
                key={f}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', borderRadius: '8px',
                  backgroundColor: metricFilter === f ? '#fff' : 'transparent',
                  color: metricFilter === f ? '#ed64a6' : '#4a5568', fontWeight: 'bold',
                  cursor: 'pointer', boxShadow: metricFilter === f ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
                }}
                onClick={() => setMetricFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="kpi-stack" style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: loadingKpis ? 0.5 : 1, transition: 'opacity 0.3s' }}>
            
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ backgroundColor: '#fbcfe8', color: '#97266d', padding: '12px 16px', fontWeight: 'bold', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Faturamento Bruto (R$)
              </div>
              <div style={{ padding: '24px 16px', fontSize: '32px', fontWeight: '900', color: '#2d3748', textAlign: 'center' }}>
                {loadingKpis ? "..." : kpiData.revenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ backgroundColor: '#fbcfe8', color: '#97266d', padding: '12px 16px', fontWeight: 'bold', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Total em Descontos (R$)
              </div>
              <div style={{ padding: '24px 16px', fontSize: '32px', fontWeight: '900', color: '#2d3748', textAlign: 'center' }}>
                {loadingKpis ? "..." : kpiData.discount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ backgroundColor: '#fbcfe8', color: '#97266d', padding: '12px 16px', fontWeight: 'bold', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Ticket Médio (R$)
              </div>
              <div style={{ padding: '24px 16px', fontSize: '32px', fontWeight: '900', color: '#2d3748', textAlign: 'center' }}>
                {loadingKpis ? "..." : kpiData.avgTicket.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ backgroundColor: '#fbcfe8', color: '#97266d', padding: '12px 16px', fontWeight: 'bold', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Unidades Vendidas (Un)
              </div>
              <div style={{ padding: '24px 16px', fontSize: '32px', fontWeight: '900', color: '#2d3748', textAlign: 'center' }}>
                {loadingKpis ? "..." : kpiData.totalSales}
              </div>
            </div>

          </div>
        </div>

        {/* --- COLUNA DIREITA (Gráficos e Tabelas) --- */}
        <div className="main-content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#d53f8c', fontSize: '16px' }}>Mais Vendidos</h3>
              <div style={{ display: 'flex', gap: '8px', backgroundColor: '#edf2f7', padding: '4px', borderRadius: '8px' }}>
                {["Produtos", "Marcas"].map(tab => (
                  <button key={tab} style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: topProductsTab === tab ? '#fff' : 'transparent', color: topProductsTab === tab ? '#d53f8c' : '#718096', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }} onClick={() => setTopProductsTab(tab)}>{tab}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: '20px', flex: 1 }}>
               <Table columns={["", "Nome", "Qtd (Un)"]} data={topProductsData} />
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#d53f8c', fontSize: '16px' }}>Faturamento Tempo</h3>
              <div style={{ display: 'flex', gap: '8px', backgroundColor: '#edf2f7', padding: '4px', borderRadius: '8px' }}>
                  {["Mensal", "Semanal"].map(tab => (
                   <button key={tab} style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: revenueChartTab === tab ? '#fff' : 'transparent', color: revenueChartTab === tab ? '#d53f8c' : '#718096', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }} onClick={() => setRevenueChartTab(tab)}>{tab}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: '20px', flex: 1, minHeight: '250px' }}>
              <Chart type="line" data={revenueData} xKey="Período" yKey="Faturamento" color="#ed64a6" />
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#d53f8c', fontSize: '16px' }}>Equipe (Ranking)</h3>
              <div style={{ display: 'flex', gap: '8px', backgroundColor: '#edf2f7', padding: '4px', borderRadius: '8px' }}>
                 {["Mensal", "Semanal"].map(tab => (
                   <button key={tab} style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: employeeTab === tab ? '#fff' : 'transparent', color: employeeTab === tab ? '#d53f8c' : '#718096', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }} onClick={() => setEmployeeTab(tab)}>{tab}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: '20px', flex: 1 }}>
              <Table columns={["Nome", "Nº Vendas", "Total R$", "Comissão R$"]} data={employeeData} />
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#d53f8c', fontSize: '16px' }}>Pico por Dia</h3>
              <div style={{ display: 'flex', gap: '8px', backgroundColor: '#edf2f7', padding: '4px', borderRadius: '8px' }}>
                 {["Atual"].map(tab => (
                   <button key={tab} style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: weekDayTab === tab ? '#fff' : 'transparent', color: weekDayTab === tab ? '#d53f8c' : '#718096', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }} onClick={() => setWeekDayTab(tab)}>{tab}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: '20px', flex: 1, minHeight: '250px' }}>
               <Chart type="bar" data={weekData} xKey="Dia" yKey="Faturamento" color="#ed64a6" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}