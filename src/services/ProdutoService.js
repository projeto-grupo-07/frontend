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
  getPaginated: async (pagina = 0, tamanho = 15) => {
    try {
      const response = await api.get(`${ENDPOINT}/paginas?pagina=${pagina}&tamanho=${tamanho}`);
      return response;
    } catch (error) {
      console.error("Erro ao buscar produtos paginados:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`${ENDPOINT}/todos/${id}`);
      return response
    } catch (err) {
      console.error("Erro ao buscar produto por ID:", err);
      throw err;
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

  delete: async (id) => {
  try {
    const res = await api.delete(`${ENDPOINT}/${id}`);

    return res;
  } catch (err) {

    throw err;
  }
},

  getParentCategories: async () => {
    const response = await api.get('/pais');
    return response.data;
  },

  getChildrenCategories: async (parentId) => {
    if (!parentId) return [];
    const parents = await api.get('/pais').then(r => r.data).catch(() => []);
    const parent = Array.isArray(parents) ? parents.find(p => p.id === Number(parentId)) : null;
    return parent?.subcategorias ?? [];
  },

  updateCalcado: async (id, product) => {
    try {
      const res = await api.put(`${ENDPOINT}/calcado/${id}`, product);
      return res.data;
    } catch (err) {
      console.error("Erro ao atualizar calçado:", err);
      throw err;
    }
  },

  updateOutros: async (id, product) => {
    try {
      const res = await api.put(`${ENDPOINT}/outros/${id}`, product);
      return res.data;
    } catch (err) {
      console.error("Erro ao atualizar produto 'outros':", err);
      throw err;
    }
  },
}

export default ProductService;
