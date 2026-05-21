import React, { useState, useEffect, useContext } from 'react';
import { Modal } from "../Modal"; 
import { FuncionarioService } from '../../../services/FuncionarioService';
import { VendaService } from '../../../services/VendaService';
import { ClienteService } from '../../../services/ClienteService';
import { AuthContext } from "../../../contexts/AuthContext";
import { Search, UserCheck, X } from 'lucide-react';

export default function FinalizarVendaModal({ show, onClose, onConfirm, itensVenda = [] }) {
    const { user } = useContext(AuthContext);
    const [vendedores, setVendedores] = useState([]);
    const [idVendedor, setIdVendedor] = useState("");
    
    const [formasPagamentoOptions, setFormasPagamentoOptions] = useState([]);
    const [formaPagamento, setFormaPagamento] = useState("");

    const [cpfBusca, setCpfBusca] = useState("");
    const [clienteSelecionado, setClienteSelecionado] = useState(null);

    const totalVenda = Array.isArray(itensVenda)
        ? itensVenda.reduce((acc, item) => acc + (Number(item.total) || 0), 0)
        : 0;

    const totalDesconto = Array.isArray(itensVenda)
        ? itensVenda.reduce((acc, item) => acc + (Number(item.desconto) || 0), 0)
        : 0;

    useEffect(() => {
        if (show) {
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
                    console.error(err);
                }
            };

            const fetchFormasPagamento = async () => {
                try {
                    const formas = await VendaService.getFormasPagamento();
                    setFormasPagamentoOptions(formas);
                    
                    if (formas && formas.length > 0) {
                        setFormaPagamento(formas[0]);
                    }
                } catch (err) {
                    console.error(err);
                }
            };

            fetchVendedores();
            fetchFormasPagamento();
            setClienteSelecionado(null);
            setCpfBusca("");
        }
    }, [show, user]);

    const formatarNomePagamento = (nomeCru) => {
        switch (nomeCru) {
            case 'DEBITO': return 'Cartão de Débito';
            case 'CREDITO': return 'Cartão de Crédito';
            case 'PIX': return 'PIX';
            case 'DINHEIRO': return 'Dinheiro à Vista';
            default: return nomeCru;
        }
    };

    const handleBuscarCliente = async () => {
        if (!cpfBusca.trim()) return;
        try {
            const res = await ClienteService.buscarPorCpf(cpfBusca);
            setClienteSelecionado(res.data || res);
        } catch (error) {
            alert("Cliente não encontrado com este CPF.");
            setClienteSelecionado(null);
        }
    };

    const handleRemoverCliente = () => {
        setClienteSelecionado(null);
        setCpfBusca("");
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
            idCliente: clienteSelecionado ? clienteSelecionado.id : null,
            formaPagamento: formaPagamento, 
            itensVenda: itensLimposParaBackend
        };

        onConfirm(payload);
    };

    if (!show) return null;

    return (
        <Modal show={show} title="Finalizar Venda" onClose={onClose}>
            
            <div className="form-group" style={{ marginBottom: '15px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Identificar Cliente (Opcional)</label>
                
                {!clienteSelecionado ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Digite o CPF..."
                            value={cpfBusca}
                            onChange={(e) => setCpfBusca(e.target.value)}
                            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                        />
                        <button 
                            type="button" 
                            onClick={handleBuscarCliente} 
                            style={{ padding: '0 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            <Search size={18} />
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46' }}>
                            <UserCheck size={20} />
                            <span><strong>Cliente:</strong> {clienteSelecionado.nome}</span>
                        </div>
                        <button 
                            type="button" 
                            onClick={handleRemoverCliente} 
                            style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
            </div>

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