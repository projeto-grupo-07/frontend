import { useState, useEffect } from 'react';
import { FuncionarioService } from '../../../services/FuncionarioService';
import './styles.css';

function EditarComissaoModal({ show, onClose, funcionario, onUpdateSuccess }) {
    const [comissao, setComissao] = useState(0);
    const [loading, setLoading] = useState(false);

    // Sincroniza o estado quando o funcionário selecionado muda
    useEffect(() => {
        if (funcionario) {
            // Converte de decimal (0.1) para percentual (10) para facilitar a edição
            setComissao(funcionario.comissao * 100);
        }
    }, [funcionario]);

    const handleSave = async () => {
        try {
            setLoading(true);
            // Prepara o objeto mantendo os dados obrigatórios e atualizando a taxa
            const dadosAtualizados = {
                ...funcionario,
                comissao: comissao / 100 // Volta para o formato decimal exigido pelo backend
            };

            await FuncionarioService.update(funcionario.id, dadosAtualizados);
            alert("Taxa de comissão atualizada com sucesso!");
            onUpdateSuccess();
            onClose();
        } catch (err) {
            console.error("Erro ao atualizar comissão:", err);
            alert("Falha ao atualizar a taxa.");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <h2>Editar Comissão: {funcionario?.nome}</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </header>

                <div className="modal-body">
                    <label>Nova Taxa de Comissão (%)</label>
                    <input 
                        type="number" 
                        value={comissao} 
                        onChange={(e) => setComissao(Number(e.target.value))}
                        placeholder="Ex: 10"
                    />
                    <p className="helper-text">Insira o valor em porcentagem (Ex: 10 para 10%).</p>
                </div>

                <footer className="modal-footer">
                    <button onClick={onClose} className="btn-cancel">Cancelar</button>
                    <button onClick={handleSave} className="btn-save" disabled={loading}>
                        {loading ? "Salvando..." : "Salvar Alteração"}
                    </button>
                </footer>
            </div>
        </div>
    );
}

export default EditarComissaoModal;