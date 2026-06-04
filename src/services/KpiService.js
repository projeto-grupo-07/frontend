import api from './api/api';

export const KpiService = {
    // ========================================================================
    // --- KPIs DE FATURAMENTO GERAL ---
    // ========================================================================
    getFaturamentoDiario: async () => {
        console.log("➡️ Chamando: GET /kpis/faturamento-diario");
        const res = await api.get('/kpis/faturamento-diario');
        return res;
    },
    getFaturamentoSemanal: async () => {
        console.log("➡️ Chamando: GET /kpis/faturamento-semanal");
        const res = await api.get('/kpis/faturamento-semanal');
        return res;
    },
    getFaturamentoMensal: async () => {
        console.log("➡️ Chamando: GET /kpis/faturamento-mensal");
        const res = await api.get('/kpis/faturamento-mensal');
        return res;
    },
    getFaturamentoSemestral: async () => {
        console.log("➡️ Chamando: GET /kpis/faturamento-semestral");
        const res = await api.get('/kpis/faturamento-semestral');
        return res;
    },

    // ========================================================================
    // --- KPIs DE VOLUME DE VENDAS (Nº DE PEDIDOS) ---
    // ========================================================================
    getTotalVendasDiario: async () => {
        console.log("➡️ Chamando: GET /kpis/total-vendas-diario");
        const res = await api.get('/kpis/total-vendas-diario');
        return res;
    },
    getTotalVendasSemanal: async () => {
        console.log("➡️ Chamando: GET /kpis/total-vendas-semanal");
        const res = await api.get('/kpis/total-vendas-semanal');
        return res;
    },
    getTotalVendasMensal: async () => {
        console.log("➡️ Chamando: GET /kpis/total-vendas-mensal");
        const res = await api.get('/kpis/total-vendas-mensal');
        return res;
    },
    getTotalVendasSemestral: async () => {
        console.log("➡️ Chamando: GET /kpis/total-vendas-semestral");
        const res = await api.get('/kpis/total-vendas-semestral');
        return res;
    },

    // ========================================================================
    // --- KPIs DE TICKET MÉDIO ---
    // ========================================================================
    getTicketMedioDiario: async () => {
        console.log("➡️ Chamando: GET /kpis/ticket-medio-diario");
        const res = await api.get('/kpis/ticket-medio-diario');
        return res;
    },
    getTicketMedioSemanal: async () => {
        console.log("➡️ Chamando: GET /kpis/ticket-medio-semanal");
        const res = await api.get('/kpis/ticket-medio-semanal');
        return res;
    },
    getTicketMedioMensal: async () => {
        console.log("➡️ Chamando: GET /kpis/ticket-medio-mensal");
        const res = await api.get('/kpis/ticket-medio-mensal');
        return res;
    },
    getTicketMedioSemestral: async () => {
        console.log("➡️ Chamando: GET /kpis/ticket-medio-semestral");
        const res = await api.get('/kpis/ticket-medio-semestral');
        return res;
    },

    // ========================================================================
    // --- KPIs INDIVIDUAIS POR VENDEDOR ---
    // ========================================================================
    getFaturamentoPorVendedor: async (id) => {
        console.log(`➡️ Chamando: GET /kpis/vendedor/${id}/faturamento`);
        const res = await api.get(`/kpis/vendedor/${id}/faturamento`);
        return res;
    },
    getComissaoPorVendedor: async (id) => {
        console.log(`➡️ Chamando: GET /kpis/vendedor/${id}/comissao`);
        const res = await api.get(`/kpis/vendedor/${id}/comissao`);
        return res;
    },
    getQuantidadeVendasPorVendedor: async (id) => {
        console.log(`➡️ Chamando: GET /kpis/vendedor/${id}/quantidade`);
        const res = await api.get(`/kpis/vendedor/${id}/quantidade`);
        return res;
    },

    // ========================================================================
    // --- KPIs DE DESCONTOS ---
    // ========================================================================
    getDescontoDiario: async () => {
        console.log("➡️ Chamando: GET /kpis/desconto-diario");
        const res = await api.get('/kpis/desconto-diario');
        return res;
    },
    getDescontoSemanal: async () => {
        console.log("➡️ Chamando: GET /kpis/desconto-semanal");
        const res = await api.get('/kpis/desconto-semanal');
        return res;
    },
    getDescontoMensal: async () => {
        console.log("➡️ Chamando: GET /kpis/desconto-mensal");
        const res = await api.get('/kpis/desconto-mensal');
        return res;
    },
    getDescontoSemestral: async () => {
        console.log("➡️ Chamando: GET /kpis/desconto-semestral");
        const res = await api.get('/kpis/desconto-semestral');
        return res;
    },

    // ========================================================================
    // --- KPIs DE UNIDADES VENDIDAS ---
    // ========================================================================
    getUnidadesDiario: async () => {
        console.log("➡️ Chamando: GET /kpis/unidades-diario");
        const res = await api.get('/kpis/unidades-diario');
        return res;
    },
    getUnidadesSemanal: async () => {
        console.log("➡️ Chamando: GET /kpis/unidades-semanal");
        const res = await api.get('/kpis/unidades-semanal');
        return res;
    },
    getUnidadesMensal: async () => {
        console.log("➡️ Chamando: GET /kpis/unidades-mensal");
        const res = await api.get('/kpis/unidades-mensal');
        return res;
    },
    getUnidadesSemestral: async () => {
        console.log("➡️ Chamando: GET /kpis/unidades-semestral");
        const res = await api.get('/kpis/unidades-semestral');
        return res;
    },

    // ========================================================================
    // --- DADOS ESTÁTICOS ANTIGOS (Mantidos por segurança) ---
    // ========================================================================
    getGraficoFaturamentoMensal: async () => {
        const res = await api.get('/kpis/grafico-faturamento-mensal');
        return res;
    },
    getGraficoFaturamentoSemanal: async () => {
        const res = await api.get('/kpis/grafico-faturamento-semanal');
        return res;
    },
    getGraficoPicoDia: async () => {
        const res = await api.get('/kpis/grafico-pico-dia');
        return res;
    },
    getRankingProdutosMes: async () => {
        const res = await api.get('/kpis/ranking-produtos-mes');
        return res;
    },
    getRankingMarcasMes: async () => {
        const res = await api.get('/kpis/ranking-marcas-mes');
        return res;
    },
    getDesempenhoEquipeMes: async () => {
        const res = await api.get('/kpis/desempenho-equipe-mes');
        return res;
    },
    getDesempenhoEquipeSemana: async () => {
        const res = await api.get('/kpis/desempenho-equipe-semana');
        return res;
    },

    // ========================================================================
    // --- NOVOS ENDPOINTS DINÂMICOS DO DASHBOARD ---
    // ========================================================================
    getGraficoFaturamentoDinamico: async (filtro) => {
        const params = new URLSearchParams({ tipo: filtro.tipo });
        if (filtro.inicio) params.append('inicio', filtro.inicio);
        if (filtro.fim) params.append('fim', filtro.fim);
        const res = await api.get(`/kpis/graficos/faturamento-dinamico?${params.toString()}`);
        return res;
    },
    getGraficoPicoDiaDinamico: async (filtro) => {
        const params = new URLSearchParams({ tipo: filtro.tipo });
        if (filtro.inicio) params.append('inicio', filtro.inicio);
        if (filtro.fim) params.append('fim', filtro.fim);
        const res = await api.get(`/kpis/graficos/pico-dia-dinamico?${params.toString()}`);
        return res;
    },
    getRankingProdutosDinamico: async (filtro) => {
        const params = new URLSearchParams({ tipo: filtro.tipo });
        if (filtro.inicio) params.append('inicio', filtro.inicio);
        if (filtro.fim) params.append('fim', filtro.fim);
        const res = await api.get(`/kpis/tabelas/ranking-produtos-dinamico?${params.toString()}`);
        return res;
    },
    getRankingMarcasDinamico: async (filtro) => {
        const params = new URLSearchParams({ tipo: filtro.tipo });
        if (filtro.inicio) params.append('inicio', filtro.inicio);
        if (filtro.fim) params.append('fim', filtro.fim);
        const res = await api.get(`/kpis/tabelas/ranking-marcas-dinamico?${params.toString()}`);
        return res;
    },
    getDesempenhoEquipeDinamico: async (filtro) => {
        const params = new URLSearchParams({ tipo: filtro.tipo });
        if (filtro.inicio) params.append('inicio', filtro.inicio);
        if (filtro.fim) params.append('fim', filtro.fim);
        const res = await api.get(`/kpis/tabelas/desempenho-equipe-dinamico?${params.toString()}`);
        return res;
    },

    getMapaSazonalidade: async (ano) => {
        const res = await api.get(`/kpis/graficos/sazonalidade?ano=${ano}`);
        return res; 
    },

    // ========================================================================
    // --- DASHBOARD ESTRATÉGICA ---
    // ========================================================================
    getDesempenhoPagamentos: async (filtro) => {
        const params = new URLSearchParams();
        if (filtro.inicio) params.append('inicio', filtro.inicio);
        if (filtro.fim) params.append('fim', filtro.fim);
        const res = await api.get(`/vendas/estrategico/pagamentos?${params.toString()}`);
        return res;
    },
    
    getProdutosRentaveis: async (filtro) => {
        const params = new URLSearchParams();
        if (filtro.inicio) params.append('inicio', filtro.inicio);
        if (filtro.fim) params.append('fim', filtro.fim);
        const res = await api.get(`/vendas/estrategico/produtos-rentaveis?${params.toString()}`);
        return res;
    },
    
    getMargemCategoria: async (filtro) => {
        const params = new URLSearchParams();
        if (filtro.inicio) params.append('inicio', filtro.inicio);
        if (filtro.fim) params.append('fim', filtro.fim);
        const res = await api.get(`/vendas/estrategico/margem-categoria?${params.toString()}`);
        return res;
    }
};