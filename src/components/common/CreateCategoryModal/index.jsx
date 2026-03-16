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

    if (!show) return null;

    return (
        <Modal show={show} title="Nova Categoria" onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                
                {/* Seletor de Tipo (Botões estilizados) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Tipo de Categoria</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={() => setTipo("filho")}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: tipo === "filho" ? '#ed64a6' : '#cbd5e0',
                                backgroundColor: tipo === "filho" ? '#fff0f6' : '#f7fafc',
                                color: tipo === "filho" ? '#d53f8c' : '#4a5568',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Subcategoria
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipo("pai")}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: tipo === "pai" ? '#ed64a6' : '#cbd5e0',
                                backgroundColor: tipo === "pai" ? '#fff0f6' : '#f7fafc',
                                color: tipo === "pai" ? '#d53f8c' : '#4a5568',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Categoria Principal
                        </button>
                    </div>
                </div>

                {/* Select de Categoria Principal (Só aparece se for subcategoria) */}
                {tipo === "filho" && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Pertence a qual Categoria Principal?</label>
                        <select
                            value={idPaiSelecionado}
                            onChange={(e) => setIdPaiSelecionado(e.target.value)}
                            style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px' }}
                        >
                            {pais.map(p => (
                                <option key={p.id} value={p.id}>{p.descricao}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Input de Descrição */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 }}>Nome da Categoria</label>
                    <input
                        type="text"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder={tipo === "pai" ? "Ex: Acessórios" : "Ex: Meias"}
                        style={{ padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                    />
                </div>

                {/* Botões de Ação */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#e2e8f0', color: '#4a5568', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSalvar} 
                        disabled={loading}
                        style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#ed64a6', color: '#fff', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? "Salvando..." : "Cadastrar"}
                    </button>
                </div>

            </div>
        </Modal>
    );
}