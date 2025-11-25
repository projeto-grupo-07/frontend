import './styles.css'
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"; 
import authService from "../../../services/AuthService";
import api from "../../../services/api/api"
import Input from "../../common/Input/Index"
import Button from "../../common/Button/index"



function FormularioLogin() {
    const [usuario, setUsuario] = useState("")
    const [senha, setSenha] = useState("")
    const navigate = useNavigate();

    async function autenticar(e) {
        e.preventDefault()

       
        if (usuario == "" || senha == "") {
            alert("Preencha todos os campos")
            return
        }
        
       try {
            await authService.login(usuario, senha);
            navigate("/vendas"); 

        } catch (error) {
            console.error(error);
            alert("Email ou senha inválidos!");
        }
    }

    useEffect(() => {

    })
    return (
        <>
            <form className='login-form-card'>
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
                
                <Button type="submit" onClick={autenticar}>Entrar</Button>
            </form>
        </>
    )

}

export default FormularioLogin