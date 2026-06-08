import React, { useState } from 'react';
import api from '../../../services/api/api'; 
import { Database, Loader2 } from 'lucide-react';

export default function BotaoPopularBanco() {
    const [isCarregando, setIsCarregando] = useState(false);
    
    const [quantidade, setQuantidade] = useState(2500);

    const handlePopularBanco = async () => {
        if (quantidade < 1) {
            alert("A quantidade deve ser de pelo menos 1.");
            return;
        }

        const confirmacao = window.confirm(
            `⚠️ Atenção: Isso vai gerar ${quantidade} novas vendas fictícias no banco de dados. Deseja continuar?`
        );
        if (!confirmacao) return;

        setIsCarregando(true);
        try {
            // A URL agora injeta a variável da quantidade
            await api.post(`/admin/seed?qtd=${quantidade}`);
            alert(`✅ Sucesso! ${quantidade} vendas foram geradas. Atualize a página para ver os gráficos mudarem.`);
        } catch (error) {
            console.error(error);
            alert("❌ Erro ao popular o banco. Verifique o console.");
        } finally {
            setIsCarregando(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            
            {/* Campo de Input Dinâmico */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>
                    Qtd. Vendas
                </label>
                <input 
                    type="number" 
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    min="1"
                    style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        width: '100px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        color: '#334155'
                    }}
                />
            </div>
            
            {/* Botão de Disparo */}
            <button 
                onClick={handlePopularBanco}
                disabled={isCarregando}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    backgroundColor: '#1e293b', color: 'white',
                    border: 'none', padding: '8px 16px', borderRadius: '6px',
                    cursor: isCarregando ? 'not-allowed' : 'pointer',
                    opacity: isCarregando ? 0.7 : 1,
                    fontSize: '0.9rem', fontWeight: '500',
                    height: '35px', // Trava a altura para ficar simétrico
                    marginTop: '20px' // Empurra o botão para baixo para alinhar com o input (ignorando a altura da label)
                }}
            >
                {isCarregando ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                {isCarregando ? 'Gerando...' : 'Popular Banco'}
            </button>
        </div>
    );
}