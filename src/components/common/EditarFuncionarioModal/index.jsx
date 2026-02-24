import React, { useState, useEffect } from 'react';
import { FuncionarioService } from '../../../services/FuncionarioService';
import './styles.css';

function EditarFuncionarioModal({ show, onClose, funcionario, onUpdateSuccess }) {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        cpf: '',
        salario: 0,
        comissao: 0,
        idPerfil: ''
    });

    // Sincroniza os dados do funcionário com o formulário quando o modal abre
    useEffect(() => {
        if (funcionario) {
            setFormData({
                nome: funcionario.nome || '',
                email: funcionario.email || '',
                cpf: funcionario.cpf || '',
                salario: funcionario.salario || 0,
                comissao: funcionario.comissao || 0,
                idPerfil: funcionario.perfil?.id || ''
            });
        }
    }, [funcionario]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSalvar = async () => {
        try {
            // Monta o objeto para o seu endpoint PUT /funcionarios/{id}
            const payload = {
                ...formData,
                idPerfil: Number(formData.idPerfil),
                salario: Number(formData.salario),
                comissao: Number(formData.comissao)
            };

            await FuncionarioService.update(funcionario.id, payload);
            alert("Funcionário atualizado com sucesso!");
            onUpdateSuccess(); // Recarrega a lista principal
            onClose();
        } catch (err) {
            alert("Erro ao atualizar funcionário.");
        }
    };

    if (!show || !funcionario) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content edit-card">
                <header className="modal-header azul">
                    <h3>Editar Funcionário: {funcionario.nome}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </header>

                <div className="modal-body">
                    <div className="form-group">
                        <label>Nome Completo</label>
                        <input name="nome" value={formData.nome} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>E-mail</label>
                        <input name="email" value={formData.email} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>CPF</label>
                        <input name="cpf" value={formData.cpf} onChange={handleChange} />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Salário (R$)</label>
                            <input type="number" name="salario" value={formData.salario} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Comissão (ex: 0.10 para 10%)</label>
                            <input type="number" step="0.01" name="comissao" value={formData.comissao} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Cargo / Perfil</label>
                        <select name="idPerfil" value={formData.idPerfil} onChange={handleChange}>
                            <option value="">Selecione um perfil...</option>
                            <option value="1">Dono</option>
                            <option value="2">Gerente</option>
                            <option value="3">Vendedor</option>
                        </select>
                    </div>
                </div>

                <footer className="modal-footer">
                    <button className="btn-cancelar" onClick={onClose}>Cancelar</button>
                    <button className="btn-salvar" onClick={handleSalvar}>Salvar Alterações</button>
                </footer>
            </div>
        </div>
    );
}

export default EditarFuncionarioModal;