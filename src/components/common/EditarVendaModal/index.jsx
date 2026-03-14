import React, { useState, useEffect } from 'react';
import { FiTrash } from "react-icons/fi";
import { VendaService } from '../../../services/VendaService';
import { FuncionarioService } from '../../../services/FuncionarioService';

import './styles.css';

function EditarVendaModal({ show, onClose, venda, onUpdateSuccess }) {
    const [itensEditados, setItensEditados] = useState([]);
    const [formaPagamento, setFormaPagamento] = useState("");
    const [idVendedor, setIdVendedor] = useState("");
    const [vendedores, setVendedores] = useState([]);

    useEffect(() => {
        if (show) {
            const fetchVendedores = async () => {
                try {
                    const res = await FuncionarioService.getAll();
                    const lista = Array.isArray(res) ? res : (res?.data || []);
                    setVendedores(lista);
                } catch (err) {
                    console.error("Erro ao carregar funcionários:", err);
                }
            };
            fetchVendedores();
        }
    }, [show]);

    useEffect(() => {
        if (venda) {
            setItensEditados(venda.itensDaVenda || []);
            setFormaPagamento(venda.formaPagamento || "PIX");
            setIdVendedor(venda.idVendedor || "");
        }
    }, [venda]);

    const removerItem = (index) => {
        setItensEditados(prev => prev.filter((_, i) => i !== index));
    };

    const handleSalvar = async () => {
        const payload = {
            idVendedor: Number(idVendedor),
            formaPagamento: formaPagamento,
            itensVenda: itensEditados.map(item => ({
                idProduto: item.produto.id, // Extrai apenas o ID
                quantidadeVendaProduto: item.quantidadeVendaProduto,
                valorTotalVendaProduto: item.valorTotalVendaProduto
            }))
        };

        try {
            await VendaService.update(venda.id, payload);
            alert("Venda atualizada com sucesso!");
            onUpdateSuccess();
            onClose();
        } catch (err) {
            alert("Erro ao atualizar: Verifique se o ID do vendedor e produtos são válidos.");
        }
    };

    if (!show || !venda) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content editar-venda-card">
                <header className="modal-header azul">
                    <h3>Editar Venda #{venda.id}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </header>

                <div className="modal-body">
                    <div className="edit-form-grid">
                        <div className="field">
                            <label>Vendedor</label>
                            <select
                                value={idVendedor}
                                onChange={(e) => setIdVendedor(e.target.value)}
                            >
                                {vendedores.length === 0 ? (
                                    <option>Carregando...</option>
                                ) : (
                                    vendedores.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.nome}
                                        </option>
                                    ))
                                )}
                            </select>

                        </div>
                        <div className="field">
                            <label>Método de Pagamento</label>
                            <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
                                <option value="PIX">PIX</option>
                                <option value="CREDITO">Cartão de Crédito</option>
                                <option value="DEBITO">Cartão de Débito</option>
                                <option value="DINHEIRO">Dinheiro</option>
                            </select>
                        </div>
                    </div>

                    <h4 className="section-title">Produtos na Venda</h4>
                    <div className="itens-lista">
                        {itensEditados.map((item, index) => (
                            <div key={index} className="item-edicao-linha">
                                <span>{item.produto.modelo} (Nº {item.produto.numero})</span>
                                <span>Qtd: {item.quantidadeVendaProduto}</span>
                                <span>R$ {item.valorTotalVendaProduto.toFixed(2)}</span>
                                <button onClick={() => removerItem(index)} className="btn-delete-item">
                                    <FiTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <footer className="modal-footer">
                    <button className="btn-cancelar" onClick={onClose}>Descartar</button>
                    <button className="btn-salvar" onClick={handleSalvar}>Salvar Alterações</button>
                </footer>
            </div>
        </div>
    );
}

export default EditarVendaModal;