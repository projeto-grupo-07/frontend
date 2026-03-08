import React, { useState, useEffect, useContext } from 'react';
import { Modal } from "../Modal";
import { FuncionarioService } from '../../../services/FuncionarioService';
import { AuthContext } from "../../../contexts/AuthContext";
import "./styles.css";

export default function FinalizarVendaModal({ show, onClose, onConfirm, itensVenda = [] }) {
    const { user } = useContext(AuthContext);
    const [vendedores, setVendedores] = useState([]);
    const [idVendedor, setIdVendedor] = useState("");
    const [formaPagamento, setFormaPagamento] = useState("PIX");

    const totalVenda = Array.isArray(itensVenda)
        ? itensVenda.reduce((acc, item) => {
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
        <div className="finalizar-venda-modal">
            <Modal show={show} title="Finalizar Venda" onClose={onClose}>

                <div className="form-group">
                    <label>Funcionário que vendeu</label>
                    <select
                        value={idVendedor}
                        onChange={(e) => setIdVendedor(e.target.value)}
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
                    <div className="pagamento-pills">
                        {[
                            { value: "PIX",     label: "PIX" },
                            { value: "DEBITO",  label: "Débito" },
                            { value: "CREDITO", label: "Crédito" },
                        ].map(({ value, label }) => (
                            <button
                                key={value}
                                className={`pagamento-pill ${formaPagamento === value ? "ativo" : ""}`}
                                onClick={() => setFormaPagamento(value)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="resumo-final">
                    <p>Total de Itens: <span>{itensVenda?.length || 0}</span></p>
                    <h3>R$ {totalVenda.toFixed(2)}</h3>
                </div>

                <button className="btn-concluir-venda" onClick={handleFinalizar}>
                    Concluir Venda
                </button>

            </Modal>
        </div>
    );
}
