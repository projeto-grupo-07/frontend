import React, { useState, useContext } from 'react';
import { Modal } from "../Modal";
import { CaixaService } from '../../../services/CaixaService';
import { AuthContext } from "../../../contexts/AuthContext";

export default function FecharCaixaModal({ show, onClose, onSucesso, caixaAtual }) {
    const { user } = useContext(AuthContext);
    const [saldoFinal, setSaldoFinal] = useState("");

    const handleFechar = async () => {
        if (!saldoFinal) return alert("Informe o valor em dinheiro na gaveta.");
        try {
            await CaixaService.fechar(caixaAtual.id, user.id, Number(saldoFinal));
            onSucesso();
        } catch (error) {
            alert("Erro ao fechar caixa.");
        }
    };

    if (!show || !caixaAtual) return null;

    return (
        <Modal show={show} title="Fechamento de Caixa" onClose={onClose}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
                <p style={{ margin: '5px 0' }}><strong>Abertura:</strong> {new Date(caixaAtual.dataAbertura).toLocaleString()}</p>
                <p style={{ margin: '5px 0' }}><strong>Fundo de Troco:</strong> R$ {caixaAtual.saldoInicial.toFixed(2)}</p>
                
                <label style={{ display: 'block', marginTop: '15px', marginBottom: '5px', fontWeight: 'bold' }}>Dinheiro na Gaveta (R$)</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={saldoFinal}
                    onChange={(e) => setSaldoFinal(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                    placeholder="Conte as notas e moedas e digite o total..."
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                    onClick={onClose} 
                    style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleFechar} 
                    style={{ padding: '10px 20px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Confirmar Fechamento
                </button>
            </div>
        </Modal>
    );
}