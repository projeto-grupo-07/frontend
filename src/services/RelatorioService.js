import api from './api/api';

const RelatorioService = {
  solicitarRelatorioLambda: async (payload) => {
    try {
      // Note o caminho '/lambda/' que definimos no nginx.conf
      const response = await api.post('/lambda/solicitar-relatorio', payload);
      return response.data;
    } catch (error) {
      console.error('RelatorioService: erro ao solicitar via Lambda', error);
      throw error;
    }
  }
};

export default RelatorioService;
