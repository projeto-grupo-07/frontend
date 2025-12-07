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
  }
};
