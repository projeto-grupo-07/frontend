import api from './api/api';

export const KpiService = {
    // ========================================================================
    // --- KPIs DE FATURAMENTO GERAL ---
    // ========================================================================
    getFaturamentoDiario: async () => {
        console.log("➡️ Chamando: GET /kpis/faturamento-diario");
        const res = await api.get('/kpis/faturamento-diario');
        console.log("✅ Retorno Faturamento Diário:", res);
        return res;
    },
    getFaturamentoSemanal: async () => {
        console.log("➡️ Chamando: GET /kpis/faturamento-semanal");
        const res = await api.get('/kpis/faturamento-semanal');
        console.log("✅ Retorno Faturamento Semanal:", res);
        return res;
    },
    getFaturamentoMensal: async () => {
        console.log("➡️ Chamando: GET /kpis/faturamento-mensal");
        const res = await api.get('/kpis/faturamento-mensal');
        console.log("✅ Retorno Faturamento Mensal:", res);
        return res;
    },

    // ========================================================================
    // --- KPIs DE VOLUME DE VENDAS (Nº DE PEDIDOS) ---
    // ========================================================================
    getTotalVendasDiario: async () => {
        console.log("➡️ Chamando: GET /kpis/total-vendas-diario");
        const res = await api.get('/kpis/total-vendas-diario');
        console.log("✅ Retorno Total Vendas Diário:", res);
        return res;
    },
    getTotalVendasSemanal: async () => {
        console.log("➡️ Chamando: GET /kpis/total-vendas-semanal");
        const res = await api.get('/kpis/total-vendas-semanal');
        console.log("✅ Retorno Total Vendas Semanal:", res);
        return res;
    },
    getTotalVendasMensal: async () => {
        console.log("➡️ Chamando: GET /kpis/total-vendas-mensal");
        const res = await api.get('/kpis/total-vendas-mensal');
        console.log("✅ Retorno Total Vendas Mensal:", res);
        return res;
    },

    // ========================================================================
    // --- KPIs DE TICKET MÉDIO ---
    // ========================================================================
    getTicketMedioDiario: async () => {
        console.log("➡️ Chamando: GET /kpis/ticket-medio-diario");
        const res = await api.get('/kpis/ticket-medio-diario');
        console.log("✅ Retorno Ticket Médio Diário:", res);
        return res;
    },
    getTicketMedioSemanal: async () => {
        console.log("➡️ Chamando: GET /kpis/ticket-medio-semanal");
        const res = await api.get('/kpis/ticket-medio-semanal');
        console.log("✅ Retorno Ticket Médio Semanal:", res);
        return res;
    },
    getTicketMedioMensal: async () => {
        console.log("➡️ Chamando: GET /kpis/ticket-medio-mensal");
        const res = await api.get('/kpis/ticket-medio-mensal');
        console.log("✅ Retorno Ticket Médio Mensal:", res);
        return res;
    },

    // ========================================================================
    // --- KPIs INDIVIDUAIS POR VENDEDOR ---
    // ========================================================================
    getFaturamentoPorVendedor: async (id) => {
        console.log(`➡️ Chamando: GET /kpis/vendedor/${id}/faturamento`);
        const res = await api.get(`/kpis/vendedor/${id}/faturamento`);
        console.log(`✅ Retorno Faturamento Vendedor ${id}:`, res);
        return res;
    },
    getComissaoPorVendedor: async (id) => {
        console.log(`➡️ Chamando: GET /kpis/vendedor/${id}/comissao`);
        const res = await api.get(`/kpis/vendedor/${id}/comissao`);
        console.log(`✅ Retorno Comissão Vendedor ${id}:`, res);
        return res;
    },
    getQuantidadeVendasPorVendedor: async (id) => {
        console.log(`➡️ Chamando: GET /kpis/vendedor/${id}/quantidade`);
        const res = await api.get(`/kpis/vendedor/${id}/quantidade`);
        console.log(`✅ Retorno Quantidade Vendas Vendedor ${id}:`, res);
        return res;
    },

    // ========================================================================
    // --- NOVOS: KPIs DE DESCONTOS ---
    // ========================================================================
    getDescontoDiario: async () => {
        console.log("➡️ Chamando: GET /kpis/desconto-diario");
        const res = await api.get('/kpis/desconto-diario');
        console.log("✅ Retorno Desconto Diário:", res);
        return res;
    },
    getDescontoSemanal: async () => {
        console.log("➡️ Chamando: GET /kpis/desconto-semanal");
        const res = await api.get('/kpis/desconto-semanal');
        console.log("✅ Retorno Desconto Semanal:", res);
        return res;
    },
    getDescontoMensal: async () => {
        console.log("➡️ Chamando: GET /kpis/desconto-mensal");
        const res = await api.get('/kpis/desconto-mensal');
        console.log("✅ Retorno Desconto Mensal:", res);
        return res;
    },

    // ========================================================================
    // --- NOVOS: KPIs DE UNIDADES VENDIDAS ---
    // ========================================================================
    getUnidadesDiario: async () => {
        console.log("➡️ Chamando: GET /kpis/unidades-diario");
        const res = await api.get('/kpis/unidades-diario');
        console.log("✅ Retorno Unidades Diário:", res);
        return res;
    },
    getUnidadesSemanal: async () => {
        console.log("➡️ Chamando: GET /kpis/unidades-semanal");
        const res = await api.get('/kpis/unidades-semanal');
        console.log("✅ Retorno Unidades Semanal:", res);
        return res;
    },
    getUnidadesMensal: async () => {
        console.log("➡️ Chamando: GET /kpis/unidades-mensal");
        const res = await api.get('/kpis/unidades-mensal');
        console.log("✅ Retorno Unidades Mensal:", res);
        return res;
    },

    // ========================================================================
    // --- NOVOS: DADOS PARA GRÁFICOS E TABELAS (LISTAS) ---
    // ========================================================================
    getGraficoFaturamentoMensal: async () => {
        console.log("➡️ Chamando: GET /kpis/grafico-faturamento-mensal");
        const res = await api.get('/kpis/grafico-faturamento-mensal');
        console.log("✅ Retorno Gráfico Faturamento Mensal:", res);
        return res;
    },
    getGraficoFaturamentoSemanal: async () => {
        console.log("➡️ Chamando: GET /kpis/grafico-faturamento-semanal");
        const res = await api.get('/kpis/grafico-faturamento-semanal');
        console.log("✅ Retorno Gráfico Faturamento Semanal:", res);
        return res;
    },
    getGraficoPicoDia: async () => {
        console.log("➡️ Chamando: GET /kpis/grafico-pico-dia");
        const res = await api.get('/kpis/grafico-pico-dia');
        console.log("✅ Retorno Gráfico Pico Dia:", res);
        return res;
    },
    getRankingProdutosMes: async () => {
        console.log("➡️ Chamando: GET /kpis/ranking-produtos-mes");
        const res = await api.get('/kpis/ranking-produtos-mes');
        console.log("✅ Retorno Ranking Produtos:", res);
        return res;
    },
    getRankingMarcasMes: async () => {
        console.log("➡️ Chamando: GET /kpis/ranking-marcas-mes");
        const res = await api.get('/kpis/ranking-marcas-mes');
        console.log("✅ Retorno Ranking Marcas:", res);
        return res;
    },
    getDesempenhoEquipeMes: async () => {
        console.log("➡️ Chamando: GET /kpis/desempenho-equipe-mes");
        const res = await api.get('/kpis/desempenho-equipe-mes');
        console.log("✅ Retorno Desempenho Equipe Mensal:", res);
        return res;
    },
    getDesempenhoEquipeSemana: async () => {
        console.log("➡️ Chamando: GET /kpis/desempenho-equipe-semana");
        const res = await api.get('/kpis/desempenho-equipe-semana');
        console.log("✅ Retorno Desempenho Equipe Semanal:", res);
        return res;
    }
};