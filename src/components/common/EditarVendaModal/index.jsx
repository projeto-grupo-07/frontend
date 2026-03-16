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
    const [formasPagamentoOptions, setFormasPagamentoOptions] = useState([]);

    useEffect(() => {
        if (show) {
            const fetchDados = async () => {
                try {
                    const resFunc = await FuncionarioService.getAll();
                    setVendedores(Array.isArray(resFunc) ? resFunc : (resFunc?.data || []));

                    const resPgto = await VendaService.getFormasPagamento();
                    setFormasPagamentoOptions(Array.isArray(resPgto) ? resPgto : (resPgto?.data || []));
                } catch (err) {
                    console.error("Erro ao carregar dados do modal de edição:", err);
                }
            };
            fetchDados();
        }
    }, [show]);

    useEffect(() => {
        if (venda) {
            const itensComDesconto = (venda.itensDaVenda || []).map(item => ({
                ...item,
                desconto: item.desconto || 0.00
            }));
            
            setItensEditados(itensComDesconto);
            setFormaPagamento(venda.formaPagamento || "PIX");
            setIdVendedor(venda.idVendedor || "");
        }
    }, [venda]);

    const handleAtualizarDesconto = (index, novoDesconto) => {
        const valorDesconto = Number(novoDesconto);
        if (valorDesconto < 0) return;

        setItensEditados(prev => {
            const novaLista = [...prev];
            const item = {...novaLista[index]}; 
            
            const precoUnitario = item.produto.valorUnitario || (item.valorTotalVendaProduto / item.quantidadeVendaProduto);
            const subtotalBruto = precoUnitario * item.quantidadeVendaProduto;

            if (valorDesconto > subtotalBruto) {
                alert(`O desconto não pode ser maior que o subtotal bruto (R$ ${subtotalBruto.toFixed(2)}).`);
                return novaLista; 
            }

            item.desconto = valorDesconto;
            item.valorTotalVendaProduto = subtotalBruto - valorDesconto; 
            
            novaLista[index] = item;
            return novaLista;
        });
    };

    const removerItem = (index) => {
        setItensEditados(prev => prev.filter((_, i) => i !== index));
    };

    const formatarNomePagamento = (nomeCru) => {
        switch (nomeCru) {
            case 'DEBITO': return 'Cartão de Débito';
            case 'CREDITO': return 'Cartão de Crédito';
            case 'PIX': return 'PIX';
            case 'DINHEIRO': return 'Dinheiro à Vista';
            default: return nomeCru; 
        }
    };

    const formatarNomeProduto = (produto) => {
        if (!produto) return "Produto não encontrado";
        const nomePrincipal = produto.marca || produto.nome || "";
        const detalhe = produto.modelo || produto.descricao || "";
        const numeroFormatado = (produto.numero && produto.numero > 0) ? ` (Nº ${produto.numero})` : "";
        return `${nomePrincipal} ${detalhe}${numeroFormatado}`.trim();
    };

    const handleSalvar = async () => {
        const payload = {
            idVendedor: Number(idVendedor),
            formaPagamento: formaPagamento,
            itensVenda: itensEditados.map(item => ({
                idProduto: item.produto.id, 
                quantidadeVendaProduto: item.quantidadeVendaProduto,
                desconto: Number(item.desconto) || 0.00
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
                                {(!formasPagamentoOptions || formasPagamentoOptions.length === 0) ? (
                                    <option value="">Carregando...</option>
                                ) : (
                                    formasPagamentoOptions.map((forma) => (
                                        <option key={forma} value={forma}>
                                            {formatarNomePagamento(forma)}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    <h4 className="section-title">Produtos na Venda</h4>
                    <div className="itens-lista">
                        
                        {/* CABEÇALHO ALINHADO */}
                        <div className="item-edicao-linha" style={{ display: 'flex', fontWeight: 'bold', borderBottom: '2px solid #eee', paddingBottom: '8px', marginBottom: '8px', color: '#666' }}>
                            <span style={{flex: 2}}>Produto</span>
                            <span style={{width: '60px', textAlign: 'center'}}>Qtd</span>
                            <span style={{width: '90px', textAlign: 'center'}}>Desconto</span>
                            <span style={{width: '90px', textAlign: 'right'}}>Total Líquido</span>
                            <span style={{width: '40px'}}></span>
                        </div>
                        
                        {/* LISTA DE PRODUTOS */}
                        {itensEditados.map((item, index) => (
                            <div key={index} className="item-edicao-linha" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                
                                {/* AQUI ESTÁ A CORREÇÃO: Usando a função para formatar */}
                                <span style={{flex: 2}}>{formatarNomeProduto(item.produto)}</span>
                                
                                <span style={{width: '60px', textAlign: 'center'}}>{item.quantidadeVendaProduto}</span>
                                
                                <div style={{width: '90px', display: 'flex', justifyContent: 'center'}}>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="0.01"
                                        value={item.desconto === 0 ? '' : item.desconto}
                                        placeholder="0.00"
                                        onChange={(e) => handleAtualizarDesconto(index, e.target.value)}
                                        style={{ width: '100%', padding: '4px', textAlign: 'center', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>

                                <span style={{width: '90px', textAlign: 'right', fontWeight: '500'}}>
                                    R$ {item.valorTotalVendaProduto.toFixed(2)}
                                </span>
                                
                                <div style={{width: '40px', display: 'flex', justifyContent: 'flex-end'}}>
                                    <button onClick={() => removerItem(index)} className="btn-delete-item" style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', padding: '4px' }}>
                                        <FiTrash />
                                    </button>
                                </div>
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