import api from './api/api';

// ============================================================================
// HELPER: Montador Automático de Parâmetros e Formatador de Datas
// ============================================================================
const buildParams = (filtro) => {
    // Se passar apenas a string "Este Mês", converte para objeto
    const f = typeof filtro === 'string' ? { tipo: filtro } : filtro;
    
    const params = new URLSearchParams({ tipo: f.tipo || 'Este Mês' });
    
    if (f.inicio) {
        // Se vier só 'YYYY-MM-DD', anexa o começo do dia. Se já tiver 'T', mantém.
        const inicioFormatado = f.inicio.includes('T') ? f.inicio : `${f.inicio}T00:00:00`;
        params.append('inicio', inicioFormatado);
    }
    
    if (f.fim) {
        // Se vier só 'YYYY-MM-DD', anexa o fim do dia. Se já tiver 'T', mantém.
        const fimFormatado = f.fim.includes('T') ? f.fim : `${f.fim}T23:59:59`;
        params.append('fim', fimFormatado);
    }
    
    return params.toString();
};

export const KpiService = {
    // ========================================================================
    // --- MÉTODOS UNIFICADOS (KPIS DOS CARDS DA ESQUERDA) ---
    // ========================================================================
    getFaturamento: async (filtro) => {
        const query = buildParams(filtro);
        console.log(`➡️ Chamando: GET /kpis/faturamento?${query}`);
        return await api.get(`/kpis/faturamento?${query}`);
    },

    getTotalVendas: async (filtro) => {
        const query = buildParams(filtro);
        console.log(`➡️ Chamando: GET /kpis/total-vendas?${query}`);
        return await api.get(`/kpis/total-vendas?${query}`);
    },

    getTicketMedio: async (filtro) => {
        const query = buildParams(filtro);
        console.log(`➡️ Chamando: GET /kpis/ticket-medio?${query}`);
        return await api.get(`/kpis/ticket-medio?${query}`);
    },

    getTotalDescontos: async (filtro) => {
        const query = buildParams(filtro);
        console.log(`➡️ Chamando: GET /kpis/total-descontos?${query}`);
        return await api.get(`/kpis/total-descontos?${query}`);
    },

    // ========================================================================
    // --- MÉTODOS DE RENDIMENTO INDIVIDUAL (VENDEDOR) ---
    // ========================================================================
    getFaturamentoPorVendedor: async (id) => {
        console.log(`➡️ Chamando: GET /kpis/vendedor/${id}/faturamento`);
        return await api.get(`/kpis/vendedor/${id}/faturamento`);
    },

    getComissaoPorVendedor: async (id) => {
        console.log(`➡️ Chamando: GET /kpis/vendedor/${id}/comissao`);
        return await api.get(`/kpis/vendedor/${id}/comissao`);
    },

    getQuantidadeVendasPorVendedor: async (id) => {
        console.log(`➡️ Chamando: GET /kpis/vendedor/${id}/quantidade`);
        return await api.get(`/kpis/vendedor/${id}/quantidade`);
    },

    // ========================================================================
    // --- MÉTODOS DINÂMICOS (GRÁFICOS E TABELAS DA DIREITA) ---
    // ========================================================================
    getGraficoFaturamentoDinamico: async (filtro) => {
        const query = buildParams(filtro);
        console.log(`➡️ Chamando: GET /kpis/grafico-faturamento?${query}`);
        return await api.get(`/kpis/grafico-faturamento?${query}`);
    },

    getRankingProdutosDinamico: async (filtro) => {
        const query = buildParams(filtro);
        console.log(`➡️ Chamando: GET /kpis/ranking-produtos?${query}`);
        return await api.get(`/kpis/ranking-produtos?${query}`);
    },

    getGraficoPicoDiaDinamico: async (filtro) => {
        const query = buildParams(filtro);
        console.log(`➡️ Chamando: GET /kpis/grafico-pico-dia?${query}`);
        return await api.get(`/kpis/grafico-pico-dia?${query}`);
    },

    getRankingMarcasDinamico: async (filtro) => {
        const query = buildParams(filtro);
        console.log(`➡️ Chamando: GET /kpis/ranking-marcas?${query}`);
        return await api.get(`/kpis/ranking-marcas?${query}`);
    },

    getDesempenhoEquipeDinamico: async (filtro) => {
        const query = buildParams(filtro);
        console.log(`➡️ Chamando: GET /kpis/desempenho-equipe?${query}`);
        return await api.get(`/kpis/desempenho-equipe?${query}`);
    },

    getMapaSazonalidade: async (ano) => {
        console.log(`➡️ Chamando: GET /kpis/sazonalidade?ano=${ano}`);
        return await api.get(`/kpis/sazonalidade?ano=${ano}`); 
    },

    // ========================================================================
    // --- DASHBOARD ESTRATÉGICA ---
    // ========================================================================
    getDesempenhoPagamentos: async (filtro) => {
        const query = buildParams(filtro);
        return await api.get(`/kpis/estrategico/pagamentos?${query}`);
    },
    
    getProdutosRentaveis: async (filtro) => {
        const query = buildParams(filtro);
        return await api.get(`/kpis/estrategico/produtos-rentaveis?${query}`);
    },
    
    getMargemCategoria: async (filtro) => {
        const query = buildParams(filtro);
        return await api.get(`/kpis/estrategico/margem-categoria?${query}`);
    }
};