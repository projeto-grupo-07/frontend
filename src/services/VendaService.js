import api from './api/api';

const ENDPOINT = '/vendas';

export const VendaService = {
  getAll: async () => {
    try {
      const response = await api.get(ENDPOINT);
      return response;
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`${ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar venda ID ${id}:`, error);
      throw error;
    }
  },

  create: async (vendaData) => {
    try {
      const response = await api.post(ENDPOINT, vendaData);
      return response.data;
    } catch (error) {
      console.error("Erro ao cadastrar venda:", error);
      throw error;
    }
  },

  getTotalVendas: async () => {
    try {
      const response = await api.get(`${ENDPOINT}/total`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar total de vendas:", error);
      throw error;
    }
  },

  getByVendedor: async (nome) => {
    try {
      const response = await api.get(`${ENDPOINT}/vendedor/${nome}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar vendas do vendedor ${nome}:`, error);
      throw error;
    }
  },


  delete: async (id) => {
    try {
      return await api.delete(`${ENDPOINT}/${id}`);
    } catch (error) {
      console.error("Erro ao deletar venda:", error);
      throw error;
    }
  },
  update: async (id, vendaData) => {
    try {
      const response = await api.put(`${ENDPOINT}/${id}`, vendaData);
      return response;
    } catch (error) {
      console.error(`Erro ao atualizar venda ID ${id}:`, error);
      throw error;
    }
  },
  getFormasPagamento: async () => {
    try {
      const response = await api.get(`${ENDPOINT}/formas-pagamento`);

      return response;
    } catch (error) {
      console.error("Erro ao buscar formas de pagamento:", error);
      throw error;
    }
  }
}

export default VendaService;