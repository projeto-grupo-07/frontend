import api from "./api/api";

const authService = {
  login: async (email, senha) => {
    try {
      const response = await api.post("/funcionarios/login", {
        email,
        senha
      });

      console.log("RESPOSTA DA API:", response);
      console.log("DADOS:", response.data)

      if (response.token) {
        localStorage.setItem("user_token", response.token);
      }

      return response;

    } catch (error) {
      
      if (error.response) {
        const status = error.response.status;

        if (status === 401) {
          throw new Error("Usuário ou senha incorretos.");
        }
        
        if (status === 403) {
          throw new Error("Você não tem permissão para acessar o sistema.");
        }

        if (status >= 500) {
          throw new Error("Erro no servidor. Tente novamente mais tarde.");
        }
        
        throw new Error(error.response.data.message || "Ocorreu um erro inesperado.");
      }
      
      else if (error.request) {
         throw new Error("Sem conexão com o servidor. Verifique sua internet.");
      } 
      
      else {
        throw new Error("Erro ao tentar realizar o login.");
      }
    }
  },

  logout: () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("user_data"));
  }
}


export default authService
