import './styles.css'; 

import logoBrink from '../../assets/images/logo-brink.png'; 
import arrowIcon from '../../assets/images/arrow-right.png';
import LoginForm from '../../components/specific/LoginForm';

function Login() {

    return (
       
        <div className="login-page-container">
             <title>Login</title>
            <header className="login-header">
                <img src={logoBrink} alt="Logo Brink Calçados" className="logo" />
                <button className="back-button">
                    <img src={arrowIcon} alt="Voltar" className="icon-arrow" />
                </button>
            </header>
            <main className="login-content">
                <LoginForm />
            </main>
        </div>
    );
}

export default Login;