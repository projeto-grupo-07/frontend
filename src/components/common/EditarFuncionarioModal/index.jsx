import React, { useState, useEffect } from 'react';
import { FuncionarioService } from '../../../services/FuncionarioService';

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
        // Overlay (Fundo escuro)
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            
            {/* Container do Modal */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '550px', maxWidth: '95%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                
                {/* Header Azul */}
                <header style={{ backgroundColor: '#4a6b8c', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Editar Funcionário: {funcionario.nome}</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
                </header>
                
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Nome (Linha inteira) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Nome Completo</label>
                        <input name="nome" value={formData.nome} onChange={handleChange} style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
                    </div>
                    
                    {/* Linha: Função e CPF */}
                    <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Cargo / Perfil</label>
                            <select 
                                name="idPerfil" 
                                value={formData.idPerfil} 
                                onChange={handleChange}
                                style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                            >
                                <option value="">Selecione um perfil...</option>
                                <option value="1">Dono</option>
                                <option value="2">Gerente</option>
                                <option value="3">Vendedor</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>CPF</label>
                            <input name="cpf" value={formData.cpf} onChange={handleChange} maxLength="11" style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                    </div>

                    {/* Email (Linha inteira - Como a senha não é editada aqui, o email ganha destaque) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>E-mail</label>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
                    </div>

                    {/* Linha: Salário e Comissão */}
                    <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Salário (R$)</label>
                            <input name="salario" type="number" step="0.01" min="0" value={formData.salario} onChange={handleChange} style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Comissão (ex: 0.10 para 10%)</label>
                            <input name="comissao" type="number" step="0.01" min="0" value={formData.comissao} onChange={handleChange} style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                    </div>
                </div>

                {/* Rodapé com Botões */}
                <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fdfdfd' }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#e2e8f0', color: '#4a5568', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                        Cancelar
                    </button>
                    <button onClick={handleSalvar} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#ed64a6', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                        Salvar Alterações
                    </button>
                </footer>
                
            </div>
        </div>
    );
}

export default EditarFuncionarioModal;