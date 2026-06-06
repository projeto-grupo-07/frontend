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
// INTERCEPTADOR DE RESPOSTA (Trata o Token Expirado e Permissões) + logs
instance.interceptors.response.use(
  (response) => {
    try {
      console.debug('[api] response:', response.status, response.config?.method?.toUpperCase(), response.config?.url);
    } catch (e) {
      // noop
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const currentPath = window.location.pathname;

      // 401 = Token Inválido ou Expirado (Desloga o usuário)
      if (status === 401) {
        if (currentPath !== '/login' && currentPath !== '/') {
          alert("⏳ Sua sessão expirou. Por favor, faça login novamente.");
          sessionStorage.removeItem('usuario');
          window.location.href = '/login';
        }
      } 
      // 403 = Sem Permissão de Acesso (Apenas avisa, não desloga)
      else if (status === 403) {
        alert("🚫 Acesso negado! Você não tem permissão para realizar esta ação.");
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