import React, { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { CategoriesService } from "../../../services/CategoriaService";

export default function CreateCategoryModal({ show, onClose, onCreated }) {
    const [tipo, setTipo] = useState("filho"); // "pai" ou "filho"
    const [descricao, setDescricao] = useState("");
    const [pais, setPais] = useState([]);
    const [idPaiSelecionado, setIdPaiSelecionado] = useState("");
    const [loading, setLoading] = useState(false);

    // Carrega categorias pai para o select de subcategoria
    useEffect(() => {
        if (show) {
            const fetchPais = async () => {
                try {
                    const lista = await CategoriesService.getParentCategories();
                    const safe = Array.isArray(lista) ? lista : [];
                    setPais(safe);
                    if (safe.length > 0) setIdPaiSelecionado(safe[0].id);
                } catch (err) {
                    console.error("Erro ao carregar categorias pai:", err);
                }
            };
            fetchPais();
            // Reseta o form ao abrir
            setDescricao("");
            setTipo("filho");
        }
    }, [show]);

    const handleSalvar = async () => {
        if (!descricao.trim()) return alert("Informe uma descrição.");
        if (tipo === "filho" && !idPaiSelecionado) return alert("Selecione uma categoria principal.");

        setLoading(true);
        try {
            if (tipo === "pai") {
                await CategoriesService.createParent({ descricao });
            } else {
                await CategoriesService.createChild({ descricao, categoriaPaiId: Number(idPaiSelecionado) });
            }
            alert("Categoria cadastrada com sucesso!");
            if (onCreated) onCreated();
            onClose();
        } catch (err) {
            alert("Erro ao cadastrar categoria.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} title="Nova Categoria" onClose={onClose}>
            <div className="form-group">
                <label>Tipo</label>
                <div className="pagamento-pills"> {/* reusa o estilo de pills que você já tem */}
                    <button
                        type="button"
                        className={`pagamento-pill ${tipo === "filho" ? "ativo" : ""}`}
                        onClick={() => setTipo("filho")}
                    >
                        Subcategoria
                    </button>
                    <button
                        type="button"
                        className={`pagamento-pill ${tipo === "pai" ? "ativo" : ""}`}
                        onClick={() => setTipo("pai")}
                    >
                        Categoria Principal
                    </button>
                </div>
            </div>

            {/* Só aparece se for subcategoria */}
            {tipo === "filho" && (
                <div className="form-group">
                    <label>Categoria Principal</label>
                    <select
                        value={idPaiSelecionado}
                        onChange={(e) => setIdPaiSelecionado(e.target.value)}
                    >
                        {pais.map(p => (
                            <option key={p.id} value={p.id}>{p.descricao}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="form-group">
                <label>Descrição</label>
                <input
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder={tipo === "pai" ? "Ex: Acessórios" : "Ex: Meia"}
                />
            </div>

            <div className="modal-actions">
                <button className="btn-primary" onClick={handleSalvar} disabled={loading}>
                    {loading ? "Salvando..." : "Cadastrar"}
                </button>
                <button className="btn-secondary" type="button" onClick={onClose}>Cancelar</button>
            </div>
        </Modal>
    );
}