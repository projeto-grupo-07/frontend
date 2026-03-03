import { useState } from 'react';
import { FuncionarioService } from '../../../services/FuncionarioService';
import './styles.css';

function CadastrarFuncionarioModal({ show, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        cpf: '',
        senha: '',
        salario: '',
        comissao: '',
        idPerfil: 3 // Começa como 'Vendedor' por padrão (ID 3 no seu SQL)
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (formData.cpf.length < 11) {
            alert("Por favor, insira um CPF válido (11 dígitos).");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                salario: Number(formData.salario),
                comissao: Number(formData.comissao) / 100,
                idPerfil: Number(formData.idPerfil) // Garante que envie como número
            };

            await FuncionarioService.create(payload);
            alert("Funcionário cadastrado com sucesso!");
            
            // Limpa o formulário e volta ao padrão Vendedor
            setFormData({ nome: '', email: '', cpf: '', senha: '', salario: '', comissao: '', idPerfil: 3 });
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Erro ao cadastrar:", err);
            alert("Erro ao realizar cadastro. Verifique os dados.");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <h2>Novo Funcionário</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </header>
                <div className="modal-body">
                    <div className="form-group">
                        <label>Nome Completo</label>
                        <input name="nome" value={formData.nome} onChange={handleChange} />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Função / Cargo</label>
                            <select 
                                name="idPerfil" 
                                value={formData.idPerfil} 
                                onChange={handleChange}
                                className="select-field"
                            >
                                <option value={3}>Vendedor (Funcionário)</option>
                                <option value={2}>Gerente</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>CPF (apenas números)</label>
                            <input name="cpf" value={formData.cpf} onChange={handleChange} maxLength="11" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Senha</label>
                            <input name="senha" type="password" value={formData.senha} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Salário Base (R$)</label>
                            <input name="salario" type="number" value={formData.salario} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Taxa de Comissão (%)</label>
                            <input name="comissao" type="number" value={formData.comissao} onChange={handleChange} placeholder="Ex: 5" />
                        </div>
                    </div>
                </div>
                <footer className="modal-footer">
                    <button onClick={onClose} className="btn-cancel">Cancelar</button>
                    <button onClick={handleSave} className="btn-save" disabled={loading}>
                        {loading ? "Salvando..." : "Cadastrar"}
                    </button>
                </footer>
            </div>
        </div>
    );
}

export default CadastrarFuncionarioModal;