import { useState } from "react";
import MetricCard from "./MetricCard"; // Certifique-se que o caminho está correto
import Table from "./Table";           // Certifique-se que o caminho está correto
import Chart from "./Chart";           // Certifique-se que o caminho está correto
import './styles.css';                 // Importando o CSS que criaremos abaixo

// --- DADOS MOCKADOS (Mantidos do seu código original) ---
const metricsData = {
  Hoje: { revenue: 2900.45, discount: 1200.98, avgTicket: 350.87, totalSales: 103 },
  Semana: { revenue: 11320, discount: 530, avgTicket: 176, totalSales: 64 },
  Mês: { revenue: 48920, discount: 2480, avgTicket: 182, totalSales: 268 },
};

const topProductsData = {
  Hoje: [
    { Nome: "Tênis", "Total (R$)": 870.10 },
    { Nome: "Salto Alto", "Total (R$)": 580.09 },
    { Nome: "Tênis Jordan", "Total (R$)": 290.05 },
    { Nome: "Bota", "Total (R$)": 290.05 },
    { Nome: "Chinelo", "Total (R$)": 145.025 },
  ],
  Semana: [], // Pode preencher se quiser
  Mês: [],    // Pode preencher se quiser
};

const employeeData = {
  Mensal: [
    { Nome: "Gabriella", "# Vendas": 9, "Total R$": 1092, "Comissão R$": 200 },
    { Nome: "Felipe", "# Vendas": 12, "Total R$": 1232, "Comissão R$": 200 },
    { Nome: "Vinicius", "# Vendas": 14, "Total R$": 1343, "Comissão R$": 200 },
    { Nome: "Gabriel", "# Vendas": 8, "Total R$": 989, "Comissão R$": 200 },
    { Nome: "Kaio", "# Vendas": 11, "Total R$": 1176, "Comissão R$": 200 },
  ],
  Semanal: [],
};

const faturamentoMensal = [
  { Período: "Jun", Faturamento: 4200 }, { Período: "Jul", Faturamento: 6100 },
  { Período: "Ago", Faturamento: 3900 }, { Período: "Set", Faturamento: 8200 },
  { Período: "Out", Faturamento: 11000 }, { Período: "Nov", Faturamento: 8500 },
];

const faturamentoSemanal = []; // Mock se precisar

const weekData = {
  Atual: [
    { Dia: "Seg", Faturamento: 800 }, { Dia: "Ter", Faturamento: 1200 },
    { Dia: "Qua", Faturamento: 1900 }, { Dia: "Qui", Faturamento: 2100 },
    { Dia: "Sex", Faturamento: 4000 }, { Dia: "Sab", Faturamento: 3100 },
    { Dia: "Dom", Faturamento: 900 },
  ],
  Passada: [],
};

// --- COMPONENTE DASHBOARD ---

export default function Dashboard() {
  // Filtro Global (Controla os KPIs da esquerda)
  const [metricFilter, setMetricFilter] = useState("Hoje");

  // Filtros Individuais dos Cards (Tabs internas)
  const [topProductsTab, setTopProductsTab] = useState("Produtos");
  const [revenueChartTab, setRevenueChartTab] = useState("Mensal");
  const [employeeTab, setEmployeeTab] = useState("Mensal");
  const [weekDayTab, setWeekDayTab] = useState("Atual");

  // Seleção de dados baseada no estado
  const currentMetrics = metricsData[metricFilter] || metricsData["Hoje"];
  // Nota: Para os cards da direita, estou fixando alguns dados para bater com a imagem, 
  // mas você pode conectar aos filtros como fez antes se preferir.
  const currentTopProducts = topProductsData["Hoje"]; 
  const currentEmployees = employeeData["Mensal"];
  const currentRevenueData = faturamentoMensal; 
  const currentWeekData = weekData["Atual"];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        
        {/* --- COLUNA ESQUERDA (320px fixa) --- */}
        <div className="left-column">
          
          {/* Toggle Principal */}
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

          {/* KPIs Gigantes */}
          <div className="kpi-stack">
            <div className="kpi-card">
                <div className="kpi-header">Faturamento Bruto (R$) <span className="info-icon">!</span></div>
                <div className="kpi-value">{currentMetrics.revenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            </div>
            
            <div className="kpi-card">
                <div className="kpi-header">Total em Descontos (R$) <span className="info-icon">!</span></div>
                <div className="kpi-value">{currentMetrics.discount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            </div>

            <div className="kpi-card">
                <div className="kpi-header">Ticket Médio (R$) <span className="info-icon">!</span></div>
                <div className="kpi-value">{currentMetrics.avgTicket.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            </div>

            <div className="kpi-card">
                <div className="kpi-header">Total de Vendas (Un) <span className="info-icon">!</span></div>
                <div className="kpi-value">{currentMetrics.totalSales}</div>
            </div>
          </div>
        </div>

        {/* --- COLUNA DIREITA (Grid Flexível) --- */}
        <div className="main-content-grid">
          
          {/* 1. Mais Vendidos */}
          <div className="card-panel">
            <div className="card-header">
              <h3>Mais Vendidos</h3>
              <div className="pill-tabs">
                {["Produtos", "Marcas"].map(tab => (
                   <button key={tab} className={topProductsTab === tab ? "active" : ""} onClick={() => setTopProductsTab(tab)}>{tab}</button>
                ))}
                <span className="info-icon">!</span>
              </div>
            </div>
            <div className="card-body table-wrapper">
               <Table
                  columns={["", "Nome", "Total (R$)"]}
                  data={currentTopProducts.map((p, i) => ({ 
                      "#": <span className="ranking-badge">{i+1}</span>, 
                      "Nome": <span className="fw-bold">{p.Nome}</span>,
                      "Total (R$)": <span className="highlight-pill">{p["Total (R$)"].toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span> 
                  }))} 
                  useNumberColumn={false}
               />
            </div>
          </div>

          {/* 2. Gráfico Faturamento */}
          <div className="card-panel">
            <div className="card-header">
              <h3>Faturamento ao Longo do Tempo</h3>
              <div className="pill-tabs">
                  {["Mensal", "Semanal"].map(tab => (
                   <button key={tab} className={revenueChartTab === tab ? "active" : ""} onClick={() => setRevenueChartTab(tab)}>{tab}</button>
                ))}
                <span className="info-icon">!</span>
              </div>
            </div>
            <div className="card-body chart-wrapper">
              {/* Adicionei 'responsive' se seu componente Chart aceitar, ou estilizei via CSS */}
              <Chart type="line" data={currentRevenueData} xKey="Período" yKey="Faturamento" color="#5D78A9" />
            </div>
          </div>

          {/* 3. Desempenho Funcionários */}
          <div className="card-panel">
            <div className="card-header">
              <h3>Desempenho Funcionários</h3>
              <div className="pill-tabs">
                 {["Mensal", "Semanal"].map(tab => (
                   <button key={tab} className={employeeTab === tab ? "active" : ""} onClick={() => setEmployeeTab(tab)}>{tab}</button>
                ))}
                <span className="info-icon">!</span>
              </div>
            </div>
            <div className="card-body table-wrapper">
              <Table 
                columns={["Nome", "Nº Vendas", "Total R$", "Comissão R$"]} 
                data={currentEmployees} 
              />
            </div>
          </div>

          {/* 4. Gráfico Dia da Semana */}
          <div className="card-panel">
            <div className="card-header">
              <h3>Dia da Semana Mais Movimentado</h3>
              <div className="pill-tabs">
                 {["Atual", "Passada"].map(tab => (
                   <button key={tab} className={weekDayTab === tab ? "active" : ""} onClick={() => setWeekDayTab(tab)}>{tab}</button>
                ))}
                <span className="info-icon">!</span>
              </div>
            </div>
            <div className="card-body chart-wrapper">
               <Chart type="bar" data={currentWeekData} xKey="Dia" yKey="Faturamento" color="#5D78A9" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}