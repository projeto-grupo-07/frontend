import api from './api/api';

export const KpiService = {
    // --- KPIs de Faturamento Geral ---
    getFaturamentoDiario: async () => {
        return await api.get('/kpis/faturamento-diario');
    },

    getFaturamentoSemanal: async () => {
        return await api.get('/kpis/faturamento-semanal');
    },

    getFaturamentoMensal: async () => {
        return await api.get('/kpis/faturamento-mensal');
    },

    // --- KPIs de Volume de Vendas ---
    getTotalVendasDiario: async () => {
        return await api.get('/kpis/total-vendas-diario');
    },

    getTotalVendasSemanal: async () => {
        return await api.get('/kpis/total-vendas-semanal');
    },

    getTotalVendasMensal: async () => {
        return await api.get('/kpis/total-vendas-mensal');
    },

    // --- KPIs de Ticket Médio ---
    getTicketMedioDiario: async () => {
        return await api.get('/kpis/ticket-medio-diario');
    },

    getTicketMedioSemanal: async () => {
        return await api.get('/kpis/ticket-medio-semanal');
    },

    getTicketMedioMensal: async () => {
        return await api.get('/kpis/ticket-medio-mensal');
    },

    // --- KPIs Individuais por Vendedor ---
    getFaturamentoPorVendedor: async (id) => {
        return await api.get(`/kpis/vendedor/${id}/faturamento`);
    },

    getComissaoPorVendedor: async (id) => {
        return await api.get(`/kpis/vendedor/${id}/comissao`);
    },

    // NOVO ENDPOINT: Busca a quantidade de vendas de um vendedor específico
    getQuantidadeVendasPorVendedor: async (id) => {
        return await api.get(`/kpis/vendedor/${id}/quantidade`);
    }
};