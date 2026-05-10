import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext.jsx';
import Button from '../../common/Button'
import './styles.css'
import logoBrink from '../../../assets/images/logo-brink.png'; 



export const Navbar = ({ logo, actions, children }) => {
  const { user, logout, signed } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const shouldShowReportButton = location.pathname.toLowerCase().includes('estrategica');

  

   if (!signed) return null;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function handleOpenImportReport() {
    window.dispatchEvent(new CustomEvent('open-relatorio-importacao'));
  }

 const menuItems = user?.menu || [];


  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <img 
              src={logoBrink} 
              alt="Logo Brink Calçados" 
              className="navbar-logo"
            />
          </Link>
        </div>

        <ul className="navbar-links">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path}
                className={location.pathname === item.path ? 'active-link' : ''}
              >
                {item.titulo}
              </Link>
            </li>
          ))}
        </ul>

        {/* LADO DIREITO: PERFIL E SAIR */}
        <div className="navbar-actions">
          {shouldShowReportButton && (
            <button
              type="button"
              className="navbar-report-button"
              onClick={handleOpenImportReport}
            >
              Emitir relatório de importação
            </button>
          )}

          {/* <div className="user-info">
            <p className="user-name">{user?.nome || 'Usuário'}</p>
            <p className="user-role">{user?.perfil || 'Perfil'}</p>
          </div> */}
          <Button onClick={handleLogout} className="btn-logout">
            Sair
          </Button>
        </div>

      </div>
      </nav>
  );
};

