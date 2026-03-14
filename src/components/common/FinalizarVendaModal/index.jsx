import React, { useState, useEffect, useContext } from 'react';
import { Modal } from "../Modal"; 
import { FuncionarioService } from '../../../services/FuncionarioService';
import { VendaService } from '../../../services/VendaService'; // <-- IMPORTADO AQUI
import { AuthContext } from "../../../contexts/AuthContext";

export default function FinalizarVendaModal({ show, onClose, onConfirm, itensVenda = [] }) {
    const { user } = useContext(AuthContext);
    const [vendedores, setVendedores] = useState([]);
    const [idVendedor, setIdVendedor] = useState("");
    
    // Novos estados para a forma de pagamento
    const [formasPagamentoOptions, setFormasPagamentoOptions] = useState([]);
    const [formaPagamento, setFormaPagamento] = useState("");

    const totalVenda = Array.isArray(itensVenda)
        ? itensVenda.reduce((acc, item) => acc + (Number(item.total) || 0), 0)
        : 0;

    const totalDesconto = Array.isArray(itensVenda)
        ? itensVenda.reduce((acc, item) => acc + (Number(item.desconto) || 0), 0)
        : 0;

    useEffect(() => {
        if (show) {
            // 1. Busca os Vendedores
            const fetchVendedores = async () => {
                try {
                    const res = await FuncionarioService.getAll();
                    const lista = Array.isArray(res) ? res : (res?.data || []);
                    setVendedores(lista);

                    if (lista.length > 0) {
                        const usuarioLogadoNaLista = lista.find(v => v.id === user?.id);
                        if (usuarioLogadoNaLista) {
                            setIdVendedor(usuarioLogadoNaLista.id);
                        } else {
                            setIdVendedor(lista[0].id);
                        }
                    }
                } catch (err) {
                    console.error("Erro ao carregar funcionários:", err);
                }
            };

            // 2. Busca os tipos de Pagamento
            const fetchFormasPagamento = async () => {
                try {
                    const formas = await VendaService.getFormasPagamento();
                    setFormasPagamentoOptions(formas);
                    
                    // Se a API retornar a lista, já deixa a primeira opção selecionada por padrão
                    if (formas && formas.length > 0) {
                        setFormaPagamento(formas[0]);
                    }
                } catch (err) {
                    console.error("Erro ao carregar formas de pagamento:", err);
                }
            };

            fetchVendedores();
            fetchFormasPagamento();
        }
    }, [show, user]);

    // Função auxiliar para deixar o texto do Enum mais bonito na tela
    const formatarNomePagamento = (nomeCru) => {
        switch (nomeCru) {
            case 'DEBITO': return 'Cartão de Débito';
            case 'CREDITO': return 'Cartão de Crédito';
            case 'PIX': return 'PIX';
            case 'DINHEIRO': return 'Dinheiro à Vista';
            default: return nomeCru; // Fallback caso você adicione um novo e esqueça de colocar aqui
        }
    };

    const handleFinalizar = () => {
        if (!idVendedor) return alert("Selecione um vendedor!");
        if (!formaPagamento) return alert("Selecione uma forma de pagamento!");

        const itensLimposParaBackend = itensVenda.map(item => ({
            idProduto: item.idProduto,
            quantidadeVendaProduto: item.quantidadeVendaProduto,
            desconto: Number(item.desconto) || 0.00
        }));

        const payload = {
            idVendedor: Number(idVendedor),
            // Envia a string exata do Enum ("PIX", "CREDITO", etc)
            formaPagamento: formaPagamento, 
            itensVenda: itensLimposParaBackend
        };

        onConfirm(payload);
    };

    if (!show) return null;

    return (
        <Modal show={show} title="Finalizar Venda" onClose={onClose}>
            
            <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Funcionário que vendeu</label>
                <select
                    value={idVendedor}
                    onChange={(e) => setIdVendedor(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                >
                    {vendedores.length === 0 ? (
                        <option>Nenhum funcionário encontrado</option>
                    ) : (
                        vendedores.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.nome}
                            </option>
                        ))
                    )}
                </select>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Forma de pagamento</label>
                <select 
                    value={formaPagamento} 
                    onChange={(e) => setFormaPagamento(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                >
                    {/* Renderiza dinamicamente as opções que vieram do Backend */}
                    {formasPagamentoOptions.length === 0 ? (
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

            <div className="resumo-final" style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e9ecef' }}>
                <p style={{ margin: '0 0 8px 0', color: '#495057' }}>
                    Total de Itens: <strong>{itensVenda?.length || 0}</strong>
                </p>
                
                {totalDesconto > 0 && (
                    <p style={{ margin: '0 0 8px 0', color: '#e53e3e', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        Descontos Aplicados: - R$ {totalDesconto.toFixed(2)}
                    </p>
                )}
                
                <h3 style={{ margin: '10px 0 0 0', color: '#2b6cb0', fontSize: '1.5rem' }}>
                    Total Final: R$ {totalVenda.toFixed(2)}
                </h3>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                    onClick={onClose}
                    style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleFinalizar}
                    style={{ padding: '10px 20px', backgroundColor: '#48bb78', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Confirmar e Vender
                </button>
            </div>
            
        </Modal>
    );
}