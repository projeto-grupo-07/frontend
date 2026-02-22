import React, { useState, useEffect, useContext } from 'react';
import { Modal } from "../Modal";
import { FuncionarioService } from '../../../services/FuncionarioService';
import { AuthContext } from "../../../contexts/AuthContext";

export default function FinalizarVendaModal({ show, onClose, onConfirm, itensVenda = [] }) {
    const { user } = useContext(AuthContext);
    const [vendedores, setVendedores] = useState([]);
    const [idVendedor, setIdVendedor] = useState("");
    const [formaPagamento, setFormaPagamento] = useState("PIX");

    // Proteção: Garante que itensVenda seja sempre um array para o reduce
    // Dentro do FinalizarVendaModal
    const totalVenda = Array.isArray(itensVenda)
        ? itensVenda.reduce((acc, item) => {
            // Agora o nome bate com o que salvamos no Painel
            return acc + (Number(item.valorTotalVendaProduto) || 0);
        }, 0)
        : 0;

    useEffect(() => {
        if (show) {
            const fetchVendedores = async () => {
                try {
                    const res = await FuncionarioService.getAll();
                    const lista = Array.isArray(res) ? res : (res?.data || []);
                    setVendedores(lista);

                    // LÓGICA DE PADRÃO:
                    // Se o usuário logado estiver na lista, selecionamos ele. 
                    // Caso contrário, pegamos o primeiro da lista.
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
            fetchVendedores();
        }
    }, [show, user]);

    const handleFinalizar = () => {
        if (!idVendedor) return alert("Selecione um vendedor!");

        const payload = {
            idVendedor: Number(idVendedor),
            formaPagamento: formaPagamento,
            itensVenda: itensVenda
        };

        onConfirm(payload);
    };

    return (
        <Modal show={show} title="Finalizar Venda" onClose={onClose}>
            <div className="form-group">
                <label>Funcionário que vendeu</label>
                <select
                    value={idVendedor}
                    onChange={(e) => setIdVendedor(e.target.value)}
                    style={{ width: '100%', padding: '8px', display: 'block' }} // Garante visibilidade
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

            <div className="form-group">
                <label>Forma de pagamento</label>
                <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
                    <option value="PIX">PIX</option>
                    <option value="DÉBITO">Débito</option>
                    <option value="CRÉDITO">Crédito</option>
                </select>
            </div>

            <div className="resumo-final">
                <p>Total de Itens: {itensVenda?.length || 0}</p>
                <h3>Total: R$ {totalVenda.toFixed(2)}</h3>
            </div>

            <button className="btn-concluir-venda" onClick={handleFinalizar}>
                Concluir Venda
            </button>
        </Modal>
    );
}