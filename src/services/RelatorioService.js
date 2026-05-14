import api from './api/api';

const ENDPOINT = '/relatorio';

const RelatorioService = {
  solicitarRelatorioLambda: async (payload) => {
    try {
      return await api.post(`${ENDPOINT}/gerar`, payload);
    } catch (error) {
      console.error('RelatorioService: erro ao solicitar via Lambda', error);
      throw error;
    }
  }
};

export default RelatorioService;