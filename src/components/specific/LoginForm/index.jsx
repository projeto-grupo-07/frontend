import './styles.css'
import { useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"; 
import api from "../../../services/api/api"
import Input from "../../common/Input/Index"
import Button from "../../common/Button/index"
import { AuthContext } from "../../../contexts/AuthContext";

function FormularioLogin() {
    const [usuario, setUsuario] = useState("")
    const [senha, setSenha] = useState("")
    const [erro, setErro] = useState("") // Estado para guardar a mensagem de erro
    const [loading, setLoading] = useState(false) // Estado para travar o botão enquanto carrega

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    async function autenticar(e) {
        e.preventDefault()
        setErro("") // Limpa o erro anterior toda vez que tentar logar

        if (usuario === "" || senha === "") {
            setErro("Preencha todos os campos para continuar.")
            return
        }
        
        try {
            setLoading(true)
            await login(usuario, senha);
            navigate("/vendas"); 

        } catch (error) {
            console.error("Erro detalhado do Axios: ", error);
            
            // 1. Servidor fora do ar (Network Error) - Não houve resposta
            if (!error.response) {
                setErro("O servidor está indisponível no momento. Tente novamente mais tarde.");
            } 
            // 2. Senha errada ou usuário não encontrado (Status 401 ou 403)
            else if (error.response.status === 401 || error.response.status === 403) {
                setErro("Email ou senha incorretos.");
            } 
            // 3. Qualquer outra mensagem específica que seu backend enviou
            else if (error.response.data && error.response.data.message) {
                setErro(error.response.data.message);
            } 
            // 4. Erro genérico de fallback
            else {
                setErro("Ocorreu um erro inesperado ao tentar fazer login.");
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className='login-form-card' onSubmit={autenticar}>
            <h1 className='titleForm'>Login</h1>
            
            <Input 
                type="text" 
                placeholder="Login" 
                onChange={(e) => {setUsuario(e.target.value)}} 
                label="Email"
            />
            
            <Input 
                type="password" 
                placeholder="Senha" 
                onChange={(e) => {setSenha(e.target.value)}} 
                label="Senha"
            />

            {/* Renderiza a mensagem de erro condicionalmente */}
            {erro && (
                <div style={{ color: '#e53e3e', backgroundColor: '#fff5f5', padding: '10px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', textAlign: 'center', border: '1px solid #feb2b2' }}>
                    {erro}
                </div>
            )}
            
            <Button type="submit" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
            </Button>
        </form>
    )
}

export default FormularioLogin