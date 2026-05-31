import api from './api/api';

const ENDPOINT = '/caixas';

export const CaixaService = {
    abrir: async (dados) => {
        const response = await api.post(`${ENDPOINT}/abrir`, dados);
        return response;
    },

    fechar: async (id, idFuncionario, saldoFinal) => {
        const response = await api.put(`${ENDPOINT}/${id}/fechar?idFuncionario=${idFuncionario}&saldoFinal=${saldoFinal}`);
        return response;
    },

    buscarAtual: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/atual`);
            // Retorna os dados se der sucesso (200 OK)
            return response.data || response;
        } catch (error) {
            // Se der erro (ex: 204 No Content, 404 Not Found), significa que não tem caixa aberto.
            // Retornamos null silenciosamente para o React entender que tá fechado.
            return null; 
        }
    }
};