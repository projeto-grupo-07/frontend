import api from './api/api';

const ENDPOINT_BACKEND = '/relatorio';
const ENDPOINT_MS_IMPORT = '/import/report/trusted';

const RelatorioService = {
  async solicitarRelatorioLambdaEenfileirar(payload) {
    try {
      console.debug('RelatorioService.solicitarRelatorioLambdaEenfileirar: payload', payload);
      const data = await api.post(`${ENDPOINT_BACKEND}/gerar`, payload);
      console.debug('RelatorioService.solicitarRelatorioLambda: response', data);
      return data;
    } catch (error) {
      console.error('RelatorioService: erro ao solicitar via Lambda', error);
      throw error;
    }
  },
}

export default RelatorioService;