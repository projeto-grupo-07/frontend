import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import './App.css'
import Vendas from './pages/Vendas';

function App() {

  return (
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path='/vendas' element={<Vendas />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
