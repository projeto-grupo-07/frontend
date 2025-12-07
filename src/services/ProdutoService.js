import api from './api/api';

const ENDPOINT = '/produtos';

export const ProductService = {
  getAll: async () => {
    try {
      const response = await api.get(`${ENDPOINT}/todos`);
      return response;
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      throw error;
    }
  },

  createProduct: async (product) => {
    const isCalcado = product.marca !== undefined && product.marca !== null;
    try {
      if (isCalcado) {
        const res = await api.post(`${ENDPOINT}/calcado`, product);
        return res.data;
      } else {
        const res = await api.post(`${ENDPOINT}/outros`, product);
        return res.data;
      }
    } catch (err) {
      console.error("Erro ao criar produto:", err);
      throw err;
    }
  },

  delete: async (produto) => {
    return await api.delete(`${ENDPOINT}/${produto.id}`);
  },

  // returns parents (each with subcategorias array)
  getParentCategories: async () => {
    const response = await api.get('/pais');
    return response.data;
  },

  // fallback helper (calls parent endpoint and extracts subcats for a given parentId)
  getChildrenCategories: async (parentId) => {
    if (!parentId) return [];
    const parents = await api.get('/pais').then(r => r.data).catch(() => []);
    const parent = Array.isArray(parents) ? parents.find(p => p.id === Number(parentId)) : null;
    return parent?.subcategorias ?? [];
  }
};

export default ProductService;
