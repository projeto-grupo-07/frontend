import api from './api/api';

const ENDPOINT = '/categorias';

export const CategoriesService = {
  getParentCategories: async () => {
    try {
      const response = await api.get(`${ENDPOINT}/pais`);
      return response;
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      throw error;
    }
  },

  getChildrenCategories: async (parentId) => {
    try {
      const response = await api.get(`${ENDPOINT}/filho/pai/${parentId}`);
      return response; 
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      throw error;
    }
  },

  createParent: async (dados) => {  // dados: { descricao }
        const response = await api.post('/categorias/pai', dados);
        return response;
    },

    createChild: async (dados) => {   // dados: { descricao, idCategoriaPai }
        const response = await api.post('/categorias/filho', dados);
        return response;
    }
};
