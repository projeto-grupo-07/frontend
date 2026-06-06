import api from './api/api';

export const KpiService = {
    // ========================================================================
    // --- MÉTODOS UNIFICADOS (KPIS DOS CARDS DA ESQUERDA) ---
    // ========================================================================
    getFaturamento: async (tipo) => {
        const params = new URLSearchParams({ tipo });
        console.log(`➡️ Chamando: GET /kpis/faturamento?${params.toString()}`);
        const res = await api.get(`/kpis/faturamento?${params.toString()}`);
        return res;
    },

    getTotalVendas: async (tipo) => {
        const params = new URLSearchParams({ tipo });
        console.log(`➡️ Chamando: GET /kpis/total-vendas?${params.toString()}`);
        const res = await api.get(`/kpis/total-vendas?${params.toString()}`);
        return res;
    },

    getTicketMedio: async (tipo) => {
        const params = new URLSearchParams({ tipo });
        console.log(`➡️ Chamando: GET /kpis/ticket-medio?${params.toString()}`);
        const res = await api.get(`/kpis/ticket-medio?${params.toString()}`);
        return res;
    },

    getTotalDescontos: async (tipo) => {
        const params = new URLSearchParams({ tipo });
        console.log(`➡️ Chamando: GET /kpis/total-descontos?${params.toString()}`);
        const res = await api.get(`/kpis/total-descontos?${params.toString()}`);
        return res;
    },

    // ========================================================================
    // --- MÉTODOS DE RENDIMENTO INDIVIDUAL (VENDEDOR) ---
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
    // --- MÉTODOS DINÂMICOS (GRÁFICOS E TABELAS DA DIREITA) ---
    // ========================================================================
    getGraficoFaturamentoDinamico: async (filtro) => {
        const params = new URLSearchParams({ tipo: filtro.tipo });
        if (filtro.inicio) params.append('inicio', filtro.inicio);
        if (filtro.fim) params.append('fim', filtro.fim);
        console.log(`➡️ Chamando: GET /kpis/grafico-faturamento?${params.toString()}`);
        const res = await api.get(`/kpis/grafico-faturamento?${params.toString()}`);
        return res;
    },

    getRankingProdutosDinamico: async (filtro) => {
        const params = new URLSearchParams({ tipo: filtro.tipo });
        if (filtro.inicio) params.append('inicio', filtro.inicio);
        if (filtro.fim) params.append('fim', filtro.fim);
        console.log(`➡️ Chamando: GET /kpis/ranking-produtos?${params.toString()}`);
        const res = await api.get(`/kpis/ranking-produtos?${params.toString()}`);
        return res;
    },

    getGraficoPicoDiaDinamico: async (filtro) => {
        const params = new URLSearchParams({ tipo: filtro.tipo });
        if (filtro.inicio) params.append('inicio', filtro.inicio);
        if (filtro.fim) params.append('fim', filtro.fim);
        console.log(`➡️ Chamando: GET /kpis/grafico-pico-dia?${params.toString()}`);
        const res = await api.get(`/kpis/grafico-pico-dia?${params.toString()}`);
        return res;
    },

    getRankingMarcasDinamico: async (filtro) => {
        const params = new URLSearchParams({ tipo: filtro.tipo });
        if (filtro.inicio) params.append('inicio', filtro.inicio);
        if (filtro.fim) params.append('fim', filtro.fim);
        console.log(`➡️ Chamando: GET /kpis/ranking-marcas?${params.toString()}`);
        const res = await api.get(`/kpis/ranking-marcas?${params.toString()}`);
        return res;
    },

    getDesempenhoEquipeDinamico: async (filtro) => {
        const params = new URLSearchParams({ tipo: filtro.tipo });
        if (filtro.inicio) params.append('inicio', filtro.inicio);
        if (filtro.fim) params.append('fim', filtro.fim);
        console.log(`➡️ Chamando: GET /kpis/desempenho-equipe?${params.toString()}`);
        const res = await api.get(`/kpis/desempenho-equipe?${params.toString()}`);
        return res;
    },

    getMapaSazonalidade: async (ano) => {
        console.log(`➡️ Chamando: GET /kpis/sazonalidade?ano=${ano}`);
        const res = await api.get(`/kpis/sazonalidade?ano=${ano}`);
        return res; 
    }
};
