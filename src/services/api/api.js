import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true
});

// You can add common headers or auth tokens here
// instance.defaults.headers.common['Authorization'] = AUTH_TOKEN;

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