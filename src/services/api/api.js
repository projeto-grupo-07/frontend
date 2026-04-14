import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true
});

// =========================================================
// 1. INTERCEPTADOR DE REQUISIÇÃO (Envia o token)
// =========================================================
instance.interceptors.request.use((config) => {
    // Pegue o token de onde você o salva (sessionStorage ou localStorage)
    const token = sessionStorage.getItem('token'); 
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// =========================================================
// 2. INTERCEPTADOR DE RESPOSTA (Trata o Token Expirado)
// =========================================================
instance.interceptors.response.use(
    (response) => {
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
                    alert("⏳ Sua sessão expirou por inatividade. Por favor, faça login novamente.");
                    
                    // Limpa as credenciais mortas
                    sessionStorage.removeItem('token'); 
                    sessionStorage.removeItem('usuario'); 
                    
                    // Chuta para a tela de login
                    window.location.href = '/login'; 
                }
            }
        }
        return Promise.reject(error);
    }
);

// =========================================================
// MÉTODOS ORIGINAIS (Intactos)
// =========================================================

export const get = async (endpoint) => {
  try {
    const response = await instance.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Erro no GET ${endpoint}:`, error);
    throw error;
  }
};

export const post = async (endpoint, dados) => {
  try {
    const response = await instance.post(endpoint, dados);
    return response.data;
  } catch (error) {
    console.error(`Erro no POST ${endpoint}:`, error);
    throw error;
  }
};

export const put = async (endpoint, dados) => {
  try {
    const response = await instance.put(endpoint, dados);
    return response.data;
  } catch (error) {
    console.error(`Erro no PUT ${endpoint}:`, error);
    throw error;
  }
};

export const remove = async (endpoint) => {
  try {
    const response = await instance.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Erro no DELETE ${endpoint}:`, error);
    throw error;
  }
};

const api = { get, post, put, delete: remove };
export default api;