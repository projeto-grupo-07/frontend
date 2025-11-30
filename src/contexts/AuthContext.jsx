import { createContext, useState, useEffect } from "react";
import api from "../services/api/api"; 

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        console.log("AUTH: Tentando recuperar sessão (/me)...");
        const userData = await api.get("funcionarios/me"); 
        
        console.log("AUTH: Dados recebidos:", userData);

        if (!userData) {
           throw new Error("JSON vazio");
        }
        
  
        if (!userData.perfil) {
           console.warn("AUTH: O Backend retornou 200, mas sem o campo 'perfil'. Verifique o DTO!");
        }

        setUser(userData);
        console.log("AUTH: Usuário setado no estado com sucesso.");

      } catch (error) {
        console.error("AUTH: Erro ao carregar usuário:", error);
        setUser(null);
      } finally {
        setLoading(false);
        console.log("AUTH: Loading finalizado.");
      }
    }

    loadUser();
  }, []);

  async function login(email, senha) {
    const userData = await api.post("/funcionarios/login", { email, senha });
    setUser(userData);
  }

  async function logout() {
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ 
      signed: !!user, 
      user, 
      loading, 
      login, 
      logout,
      isAdmin: user?.perfil === 'ADMIN'
    }}>
      {children}
    </AuthContext.Provider>
  );
}