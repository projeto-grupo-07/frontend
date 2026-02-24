import api from './api/api';

const ENDPOINT = '/funcionarios';

export const FuncionarioService = {
    getAll: async () => {
        try {
            const response = await api.get(ENDPOINT);
            return response;
        } catch (error) {
            console.error("Erro ao buscar funcionários:", error);
            throw error;
        }
    },
    getById: async (id) => {
        try {
            // O api.get já retorna o 'data' (JSON do funcionário)
            const data = await api.get(`${ENDPOINT}/${id}`);
            return data;
        } catch (error) {
            console.error(`Erro ao buscar funcionário ${id}:`, error);
            return { nome: "Funcionário não encontrado" };
        }
    },

    // POST /funcionarios
    create: async (dados) => {
        try {
            return await api.post(ENDPOINT, dados);
        } catch (error) {
            console.error("Erro ao cadastrar funcionário:", error);
            throw error;
        }
    },

    // PUT /funcionarios/{id}
    update: async (id, dados) => {
        try {
            return await api.put(`${ENDPOINT}/${id}`, dados);
        } catch (error) {
            console.error("Erro ao atualizar funcionário:", error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            // Use .delete pois foi assim que você mapeou no objeto final do api.js
            return await api.delete(`/funcionarios/${id}`);
        } catch (error) {
            console.error("Erro ao deletar funcionário:", error);
            throw error;
        }
    }
}

export default FuncionarioService;