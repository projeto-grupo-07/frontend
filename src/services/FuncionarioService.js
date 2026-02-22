import api from './api/api';

const ENDPOINT = '/funcionarios';

export const FuncionarioService = {
  getAll: async () => {
    try {
      // ADICIONADO: O 'return' garante que o dado saia da service e chegue no modal
      const response = await api.get(ENDPOINT);
      return response; // Se o seu api.js já retorna .data, use apenas 'return response'
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      throw error;
    }
  }
}

export default FuncionarioService;