import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL; // Agora isso vale '/api'

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true // OBRIGATÓRIO: É isso que faz o Cookie do JWT viajar para o Back-end
});

// =========================================================
// O Interceptador de Requisição (Token) FOI DELETADO.
// O navegador (Chrome/Edge) agora envia o Cookie HttpOnly automaticamente!
// =========================================================

// =========================================================
// INTERCEPTADOR DE RESPOSTA (Trata o Token Expirado)
// =========================================================
// Log das requests (debug)
instance.interceptors.request.use(
  (config) => {
    try {
      console.debug('[api] request:', config.method?.toUpperCase(), config.url, {
        params: config.params,
        data: config.data,
      });
    } catch (e) {
      // noop
    }
    return config;
  },
  (error) => {
    console.error('[api] request error:', error);
    return Promise.reject(error);
  }
);

// INTERCEPTADOR DE RESPOSTA (Trata o Token Expirado) + logs
instance.interceptors.response.use(
  (response) => {
    try {
      console.debug('[api] response:', response.status, response.config?.method?.toUpperCase(), response.config?.url);
    } catch (e) {
      // noop
    }
    return response; // Deu tudo certo, segue o jogo
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // Se o backend gritar que o usuário não tem permissão (401/403)
      if (status === 401 || status === 403) {
        const currentPath = window.location.pathname;

        // Só avisa e redireciona se o usuário já não estiver na tela de login
        if (currentPath !== '/login' && currentPath !== '/') {
          alert("⏳ Sua sessão expirou. Por favor, faça login novamente.");

          // Limpa os dados do usuário (O Cookie HttpOnly o Back-end invalida)
          sessionStorage.removeItem('usuario');

          // Chuta para a tela de login
          window.location.href = '/login';
        }
      }
    }
    console.error('[api] response error:', error);
    return Promise.reject(error);
  }
);

// =========================================================
// MÉTODOS ORIGINAIS (agora aceitam `config` opcional)
// =========================================================

export const get = async (endpoint, config) => {
  try {
    const response = await instance.get(endpoint, config);
    return response.data;
  } catch (error) {
    console.error(`Erro no GET ${endpoint}:`, error);
    throw error;
  }
};

export const post = async (endpoint, dados = undefined, config = undefined) => {
  try {
    const response = await instance.post(endpoint, dados, config);
    return response.data;
  } catch (error) {
    console.error(`Erro no POST ${endpoint}:`, error);
    throw error;
  }
};

export const put = async (endpoint, dados = undefined, config = undefined) => {
  try {
    const response = await instance.put(endpoint, dados, config);
    return response.data;
  } catch (error) {
    console.error(`Erro no PUT ${endpoint}:`, error);
    throw error;
  }
};

export const remove = async (endpoint, config = undefined) => {
  try {
    const response = await instance.delete(endpoint, config);
    return response.data;
  } catch (error) {
    console.error(`Erro no DELETE ${endpoint}:`, error);
    throw error;
  }
};

const api = { get, post, put, delete: remove };
export default api;