import api from './api/api';

const ENDPOINT = '/campanhas';

export const CampanhaService = {
  listarCampanhas: async () => {
    try {
      const response = await api.get(ENDPOINT);
      return response;
    } catch (error) {
      console.error("Erro ao listar campanhas:", error);
      throw error;
    }
  },

  criarCampanha: async (dados) => {
    try {
      const response = await api.post(ENDPOINT + "/criar", dados);
      return response;
    } catch (error) {
      console.error("Erro ao criar campanha:", error);
      throw error;
    }
  },

  iniciarCampanha: async (id) => {
    try {
      const response = await api.post(`${ENDPOINT}/${id}/iniciar`);
      return response;
    } catch (error) {
      console.error("Erro ao iniciar campanha:", error);
      throw error;
    }
  },

  deletarCampanha: async (id) => {
    try {
      const response = await api.delete(`${ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error("Erro ao deletar campanha:", error);
      throw error;
    }
  },

  buscarCampanhaPorId: async (id) => {
    try {
      const response = await api.get(`${ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error("Erro ao buscar campanha:", error);
      throw error;
    }
  },

  atualizarCampanha: async (id, dados) => {
    try {
      const response = await api.put(`${ENDPOINT}/${id}`, dados);
      return response;
    } catch (error) {
      console.error("Erro ao atualizar campanha:", error);
      throw error;
    }
  },

  listarClientesDaCampanha: async (campanhaId) => {
    try {
      const response = await api.get(`${ENDPOINT}/${campanhaId}/clientes`);
      return response;
    } catch (error) {
      console.error("Erro ao listar clientes da campanha:", error);
      throw error;
    }
  },

  adicionarCliente: async (campanhaId, clienteId) => {
    try {
      const response = await api.post(`${ENDPOINT}/${campanhaId}/clientes/${clienteId}`);
      return response;
    } catch (error) {
      console.error("Erro ao adicionar cliente na campanha:", error);
      throw error;
    }
  },

  removerCliente: async (campanhaId, clienteId) => {
    try {
      const response = await api.delete(`${ENDPOINT}/${campanhaId}/clientes/${clienteId}`);
      return response;
    } catch (error) {
      console.error("Erro ao remover cliente da campanha:", error);
      throw error;
    }
  },

  filtrar: async (filtros) => {
    const params = new URLSearchParams();
    
    if (filtros.assunto) params.append('assunto', filtros.assunto);
    if (filtros.status) params.append('status', filtros.status);

    const response = await api.get(`/campanhas/filtro?${params.toString()}`);
    return response;
  },
  gerarTextoIA: async (tema) => {
    const response = await api.post(`${ENDPOINT}/gerar-texto`, { tema }, { timeout: 60000 });
    return response;
  }

  
};