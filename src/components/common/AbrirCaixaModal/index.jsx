import React, { useState, useContext } from 'react';
import { Modal } from "../Modal";
import { CaixaService } from '../../../services/CaixaService';
import { AuthContext } from "../../../contexts/AuthContext";

export default function AbrirCaixaModal({ show, onClose, onSucesso }) {
    const { user } = useContext(AuthContext);
    const [saldoInicial, setSaldoInicial] = useState("");

    const handleAbrir = async () => {
        try {
            await CaixaService.abrir({
                saldoInicial: Number(saldoInicial) || 0,
                idFuncionarioAbriu: user.id
            });
            onSucesso();
        } catch (error) {
            alert("Erro ao abrir caixa. Verifique se já não existe um aberto.");
        }
    };

    if (!show) return null;

    return (
        <Modal show={show} title="Abrir Caixa do Dia" onClose={onClose}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fundo de Troco (R$)</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={saldoInicial}
                    onChange={(e) => setSaldoInicial(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                    placeholder="Ex: 150.00"
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
                    onClick={handleAbrir} 
                    style={{ padding: '10px 20px', backgroundColor: '#48bb78', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Abrir Caixa
                </button>
            </div>
        </Modal>
    );
}