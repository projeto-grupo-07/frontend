import { useState } from 'react';
import { FuncionarioService } from '../../../services/FuncionarioService';

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
                idPerfil: Number(formData.idPerfil) 
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
        // Overlay (Fundo escuro)
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            
            {/* Container do Modal */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '550px', maxWidth: '95%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                
                {/* Header Azul */}
                <header style={{ backgroundColor: '#4a6b8c', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Novo Funcionário</h2>
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
                            <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Função / Cargo</label>
                            <select 
                                name="idPerfil" 
                                value={formData.idPerfil} 
                                onChange={handleChange}
                                style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                            >
                                <option value={3}>Vendedor (Funcionário)</option>
                                <option value={2}>Gerente</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>CPF (apenas números)</label>
                            <input name="cpf" value={formData.cpf} onChange={handleChange} maxLength="11" style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                    </div>

                    {/* Linha: Email e Senha */}
                    <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Email</label>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Senha de Acesso</label>
                            <input name="senha" type="password" value={formData.senha} onChange={handleChange} style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                    </div>

                    {/* Linha: Salário e Comissão */}
                    <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Salário Base (R$)</label>
                            <input name="salario" type="number" step="0.01" min="0" value={formData.salario} onChange={handleChange} placeholder="0.00" style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Taxa de Comissão (%)</label>
                            <input name="comissao" type="number" step="0.1" min="0" value={formData.comissao} onChange={handleChange} placeholder="Ex: 5" style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                    </div>
                </div>

                {/* Rodapé com Botões */}
                <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fdfdfd' }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#e2e8f0', color: '#4a5568', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={loading} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#ed64a6', color: '#fff', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: loading ? 0.7 : 1 }}>
                        {loading ? "Salvando..." : "Cadastrar"}
                    </button>
                </footer>
                
            </div>
        </div>
    );
}
