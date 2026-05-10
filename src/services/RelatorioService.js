import api from './api/api';

const RelatorioService = {
  emitirImportacao: async (payload) => {
    try {
      // endpoint provável no backend para iniciar emissão de relatório de importação
      const response = await api.post('/relatorios/importacao', payload);
      return response;
    } catch (error) {
      console.error('RelatorioService: erro ao emitir relatório', error);
      throw error;
    }
  }
};

export default RelatorioService;
