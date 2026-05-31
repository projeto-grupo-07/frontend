import api from './api/api';

const ENDPOINT = '/clientes';

export const ClienteService = {
  listar: async () => {
    const response = await api.get(ENDPOINT);
    return response;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response;
  },

  cadastrar: async (dados) => {
    const response = await api.post(ENDPOINT, dados);
    return response;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`${ENDPOINT}/${id}`, dados);
    return response;
  },

  deletar: async (id) => {
    const response = await api.delete(`${ENDPOINT}/${id}`);
    return response;
  },

  buscarPorNome: async (nome) => {
    const response = await api.get(`${ENDPOINT}/busca`, {
      params: { nome }
    });
    return response;
  },
  filtrar: async (filtros) => {
    const params = new URLSearchParams();
    if (filtros.nome) params.append('nome', filtros.nome);
    if (filtros.genero) params.append('genero', filtros.genero);

    const response = await api.get(`${ENDPOINT}/filtro?${params.toString()}`);
    return response;
  },
   buscarPorCpf: async (cpf) => {
    const response = await api.get(`${ENDPOINT}/cpf/${cpf}`);
    return response;
  },
  getPaginated: async (pagina = 0, tamanho = 15) => {
    const response = await api.get(`${ENDPOINT}/paginas?pagina=${pagina}&tamanho=${tamanho}`);
    return response;
  }
};