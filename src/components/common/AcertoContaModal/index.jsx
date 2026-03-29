import React, { useState, useEffect } from 'react';
import { ComissaoService } from '../../../services/ComissaoService'; // Ajuste o caminho da sua importação
import './style.css';

export default function AcertoContaModal({ show, onClose, funcionario }) {
    const [resumo, setResumo] = useState({ totalGanho: 0, totalPago: 0, saldoPendente: 0 });
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [valor, setValor] = useState("");
    const [observacao, setObservacao] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Busca os dados sempre que o modal abrir ou o funcionário mudar
    useEffect(() => {
        if (show && funcionario?.id) {
            carregarDados();
        }
    }, [show, funcionario]);

    const carregarDados = async () => {
        setLoading(true);
        try {
            const [resResumo, resHist] = await Promise.all([
                ComissaoService.getResumo(funcionario.id),
                ComissaoService.getHistorico(funcionario.id)
            ]);
            setResumo(resResumo || { totalGanho: 0, totalPago: 0, saldoPendente: 0 });
            setHistorico(resHist || []);
        } catch (error) {
            console.error("Erro ao carregar acerto de contas:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrarPagamento = async (e) => {
        e.preventDefault();
        if (!valor || Number(valor) <= 0) {
            alert("Digite um valor válido maior que zero.");
            return;
        }

        setSubmitting(true);
        try {
            await ComissaoService.registrarPagamento(funcionario.id, {
                valor: Number(valor),
                observacao: observacao
            });
            
            // Limpa o formulário e recarrega o extrato
            setValor("");
            setObservacao("");
            await carregarDados();
            alert("Pagamento registrado com sucesso!");
        } catch (error) {
            console.error("Erro ao registrar:", error);
            alert("Não foi possível registrar o pagamento.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!show || !funcionario) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content acerto-modal">
                <div className="modal-header">
                    <h2>Acerto de Contas - {funcionario.nome}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <div className="acerto-body">
                    {loading ? (
                        <div className="loading-state">Carregando extrato...</div>
                    ) : (
                        <>
                            {/* CAIXA DE SALDO */}
                            <div className="saldo-container">
                                <div className="saldo-item">
                                    <span>Total Ganho (Vida)</span>
                                    <strong>{resumo.totalGanho.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                                </div>
                                <div className="saldo-item">
                                    <span>Total Já Pago</span>
                                    <strong>{resumo.totalPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                                </div>
                                <div className="saldo-item destaque">
                                    <span>Saldo Pendente</span>
                                    <strong className={resumo.saldoPendente > 0 ? 'text-danger' : 'text-success'}>
                                        {resumo.saldoPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </strong>
                                </div>
                            </div>

                            <div className="acerto-grid">
                                {/* FORMULÁRIO DE NOVO PAGAMENTO */}
                                <div className="pagamento-form">
                                    <h3>Registrar Pagamento</h3>
                                    <form onSubmit={handleRegistrarPagamento}>
                                        <div className="form-group">
                                            <label>Valor (R$)</label>
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                min="0.01"
                                                value={valor} 
                                                onChange={(e) => setValor(e.target.value)} 
                                                placeholder="Ex: 150.00"
                                                required 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Observação</label>
                                            <input 
                                                type="text" 
                                                value={observacao} 
                                                onChange={(e) => setObservacao(e.target.value)} 
                                                placeholder="Ex: Adiantamento PIX"
                                                maxLength="255"
                                            />
                                        </div>
                                        <button type="submit" className="btn-success" disabled={submitting}>
                                            {submitting ? "Registrando..." : "Confirmar Pagamento"}
                                        </button>
                                    </form>
                                </div>

                                {/* TABELA DE HISTÓRICO */}
                                <div className="historico-lista">
                                    <h3>Histórico de Pagamentos</h3>
                                    <div className="historico-scroll">
                                        {historico.length === 0 ? (
                                            <p className="empty-text">Nenhum pagamento registrado ainda.</p>
                                        ) : (
                                            <table className="custom-table">
                                                <thead>
                                                    <tr>
                                                        <th>Data</th>
                                                        <th>Valor</th>
                                                        <th>Observação</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {historico.map((item) => (
                                                        <tr key={item.id}>
                                                            <td>{new Date(item.dataPagamento).toLocaleDateString('pt-BR')}</td>
                                                            <td style={{ color: '#d53f8c', fontWeight: 'bold' }}>
                                                                {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                            </td>
                                                            <td>{item.observacao || "-"}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}