import { useState } from "react";
import MetricCard from "./MetricCard";
import Table from "./Table";
import Chart from "./Chart";

const metricsData = {
  Hoje: {
    revenue: 1920,
    discount: 80,
    avgTicket: 160,
    totalSales: 12,
  },
  Semana: {
    revenue: 11320,
    discount: 530,
    avgTicket: 176,
    totalSales: 64,
  },
  Mês: {
    revenue: 48920,
    discount: 2480,
    avgTicket: 182,
    totalSales: 268,
  },
};

const topProductsData = {
  Hoje: [
    { Nome: "Chinelo Havaianas", "Total (R$)": 350 },
    { Nome: "Tênis Nike Air Max", "Total (R$)": 320 },
    { Nome: "Meia Esportiva Puma", "Total (R$)": 150 },
    { Nome: "Camisa Dry-Fit", "Total (R$)": 280 },
    { Nome: "Bola de Futsal Penalty", "Total (R$)": 190 },
    { Nome: "Boné Adidas", "Total (R$)": 210 },
    { Nome: "Mochila Nike", "Total (R$)": 340 },
    { Nome: "Tênis Olympikus Corre 3", "Total (R$)": 420 },
  ],

  Semana: [
    { Nome: "Tênis Adidas Run Falcon", "Total (R$)": 2900 },
    { Nome: "Tênis Nike Air Max", "Total (R$)": 2300 },
    { Nome: "Chinelo Havaianas", "Total (R$)": 1900 },
    { Nome: "Mochila Nike", "Total (R$)": 1600 },
    { Nome: "Camisa Dry-Fit", "Total (R$)": 1400 },
    { Nome: "Bola de Futsal Penalty", "Total (R$)": 1100 },
    { Nome: "Meia Esportiva Puma", "Total (R$)": 900 },
    { Nome: "Boné Adidas", "Total (R$)": 850 },
  ],

  Mês: [
    { Nome: "Tênis Nike Air Max", "Total (R$)": 8900 },
    { Nome: "Sandália Grendene", "Total (R$)": 6200 },
    { Nome: "Bota de Couro Masculina", "Total (R$)": 5750 },
    { Nome: "Tênis Adidas Run Falcon", "Total (R$)": 5400 },
    { Nome: "Tênis Olympikus Corre 3", "Total (R$)": 5100 },
    { Nome: "Mochila Nike", "Total (R$)": 4600 },
    { Nome: "Camisa Dry-Fit", "Total (R$)": 4100 },
    { Nome: "Chinelo Havaianas", "Total (R$)": 3800 },
    { Nome: "Boné Adidas", "Total (R$)": 3200 },
    { Nome: "Meia Esportiva Puma", "Total (R$)": 2950 },
  ],
};

const employeeData = {
  Mensal: [
    { Nome: "Gabriella", "# Vendas": 48, "Total R$": 18200, "Comissão R$": 820 },
    { Nome: "Felipe", "# Vendas": 55, "Total R$": 20100, "Comissão R$": 900 },
    { Nome: "Vinicius", "# Vendas": 65, "Total R$": 22760, "Comissão R$": 1020 },
    { Nome: "Mariana", "# Vendas": 42, "Total R$": 15400, "Comissão R$": 700 },
    { Nome: "Renan", "# Vendas": 38, "Total R$": 14320, "Comissão R$": 660 },
    { Nome: "Bianca", "# Vendas": 57, "Total R$": 19890, "Comissão R$": 880 },
    { Nome: "Lucas", "# Vendas": 33, "Total R$": 12180, "Comissão R$": 580 },
    { Nome: "Camila", "# Vendas": 51, "Total R$": 17600, "Comissão R$": 790 },
    { Nome: "João Pedro", "# Vendas": 28, "Total R$": 9800, "Comissão R$": 480 },
    { Nome: "Amanda", "# Vendas": 46, "Total R$": 16400, "Comissão R$": 750 },
  ],

  Semanal: [
    { Nome: "Gabriella", "# Vendas": 12, "Total R$": 4300, "Comissão R$": 200 },
    { Nome: "Felipe", "# Vendas": 16, "Total R$": 5000, "Comissão R$": 240 },
    { Nome: "Vinicius", "# Vendas": 18, "Total R$": 5700, "Comissão R$": 260 },
    { Nome: "Mariana", "# Vendas": 10, "Total R$": 3600, "Comissão R$": 170 },
    { Nome: "Renan", "# Vendas": 9, "Total R$": 3400, "Comissão R$": 160 },
    { Nome: "Bianca", "# Vendas": 14, "Total R$": 4700, "Comissão R$": 210 },
    { Nome: "Lucas", "# Vendas": 8, "Total R$": 2700, "Comissão R$": 130 },
    { Nome: "Camila", "# Vendas": 13, "Total R$": 4200, "Comissão R$": 190 },
    { Nome: "João Pedro", "# Vendas": 7, "Total R$": 2400, "Comissão R$": 110 },
    { Nome: "Amanda", "# Vendas": 11, "Total R$": 3800, "Comissão R$": 175 },
  ],
};

const faturamentoMensal = [
  { Período: "Jun", Faturamento: 42000 },
  { Período: "Jul", Faturamento: 47800 },
  { Período: "Ago", Faturamento: 39200 },
  { Período: "Set", Faturamento: 48920 },
];

const faturamentoSemanal = [
  { Período: "Seg", Faturamento: 1980 },
  { Período: "Ter", Faturamento: 2400 },
  { Período: "Qua", Faturamento: 3100 },
  { Período: "Qui", Faturamento: 3840 },
];

const weekData = {
  Atual: [
    { Dia: "Seg", Faturamento: 800 },
    { Dia: "Ter", Faturamento: 1200 },
    { Dia: "Qua", Faturamento: 1500 },
    { Dia: "Qui", Faturamento: 2000 },
  ],
  Passada: [
    { Dia: "Seg", Faturamento: 600 },
    { Dia: "Ter", Faturamento: 900 },
    { Dia: "Qua", Faturamento: 1100 },
    { Dia: "Qui", Faturamento: 1700 },
  ],
};


export default function Dashboard() {
  const [metricFilter, setMetricFilter] = useState("Mês");
  const [topProductsTab, setTopProductsTab] = useState("Produtos");
  const [performanceTab, setPerformanceTab] = useState("Mensal");
  const [weekDayTab, setWeekDayTab] = useState("Atual");

  const [viewMode, setViewMode] = useState("Visão Geral");
  const views = ["Visão Geral", "Funcionários"];

  const currentMetrics = metricsData[metricFilter];
  const currentTopProducts = topProductsData[metricFilter];
  const currentEmployees = employeeData[performanceTab];
  const currentRevenueData =
    performanceTab === "Mensal" ? faturamentoMensal : faturamentoSemanal;
  const currentWeekData = weekData[weekDayTab];

  return (
    <div className="dashboard">
      
      <div className="metrics-container">

        <div className="metric-filter">
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

        <MetricCard title="Faturamento Bruto (R$)" value={currentMetrics.revenue} />
        <MetricCard title="Total em Descontos (R$)" value={currentMetrics.discount} />
        <MetricCard title="Ticket Médio (R$)" value={currentMetrics.avgTicket} />
        <MetricCard title="Total de Vendas (Un)" value={currentMetrics.totalSales} />
      </div>

      <div className="tables-charts-container">

        <div className="view-mode-tabs">
          {views.map((v) => (
            <button
              key={v}
              className={viewMode === v ? "active" : ""}
              onClick={() => setViewMode(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="content-grid">

          {viewMode === "Visão Geral" && (
            <>
              <div className="card top-products">
                <div className="card-header">
                  <span>Mais Vendidos</span>
                  <div className="tabs">
                    {["Produtos"].map((tab) => (
                      <button
                        key={tab}
                        className={topProductsTab === tab ? "active" : ""}
                        onClick={() => setTopProductsTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <Table
                  columns={["Nome", "Total (R$)"]}
                  data={currentTopProducts.map((p, index) => ({
                    "#": index + 1,
                    ...p,
                  }))}
                  useNumberColumn={true}
                />
              </div>

              <div className="card revenue-chart">
                <div className="card-header">
                  <span>Faturamento ao Longo do Tempo</span>
                  <div className="tabs">
                    {["Mensal", "Semanal"].map((tab) => (
                      <button
                        key={tab}
                        className={performanceTab === tab ? "active" : ""}
                        onClick={() => setPerformanceTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="chart-container">
                  <Chart
                    type="line"
                    data={currentRevenueData}
                    xKey="Período"
                    yKey="Faturamento"
                  />
                </div>
              </div>
            </>
          )}

          {viewMode === "Funcionários" && (
            <>
              <div className="card employee-performance">
                <div className="card-header">
                  <span>Desempenho Funcionários</span>
                  <div className="tabs">
                    {["Mensal", "Semanal"].map((tab) => (
                      <button
                        key={tab}
                        className={performanceTab === tab ? "active" : ""}
                        onClick={() => setPerformanceTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <Table
                  columns={["Nome", "# Vendas", "Total R$", "Comissão R$"]}
                  data={currentEmployees}
                />
              </div>

              <div className="card busiest-day">
                <div className="card-header">
                  <span>Dia da Semana Mais Movimentado</span>
                  <div className="tabs">
                    {["Atual", "Passada"].map((tab) => (
                      <button
                        key={tab}
                        className={weekDayTab === tab ? "active" : ""}
                        onClick={() => setWeekDayTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="chart-container">
                  <Chart
                    type="bar"
                    data={currentWeekData}
                    xKey="Dia"
                    yKey="Faturamento"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
