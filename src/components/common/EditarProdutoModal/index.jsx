import React, { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { CategoriesService } from "../../../services/CategoriaService";
import { ProductService } from "../../../services/ProdutoService";

export default function EditarProdutoModal({ show, idProduto, onClose, onSaved }) {
    const [loading, setLoading] = useState(true);
    const [parents, setParents] = useState([]);
    const [selectedParentId, setSelectedParentId] = useState("");
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
    const [tipoForm, setTipoForm] = useState("outros");
    const [productData, setProductData] = useState({});

    useEffect(() => {
        if (!show || !idProduto) return;

        async function loadProduct() {
            try {
                setLoading(true);
                const p = await ProductService.getById(idProduto);
                setProductData(p);
            } catch (err) {
                console.error("Erro ao buscar produto:", err);
            } finally {
                setLoading(false);
            }
        }
        loadProduct();
    }, [show, idProduto]);

    useEffect(() => {
        if (!show || !productData) return;

        async function loadCategories() {
            try {
                const list = await CategoriesService.getParentCategories();
                const safeList = Array.isArray(list) ? list : [];
                setParents(safeList);

                const normalize = str =>
                    str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

                const parent = safeList.find(
                    p => normalize(p.descricao) === normalize(productData.categoriaPai)
                );

                if (parent) {
                    setSelectedParentId(parent.id);
                    setTipoForm(parent.descricao.toLowerCase() === "calçados" ? "calcado" : "outros");

                    const subId = parent.subcategorias?.some(sc => sc.id === productData.idCategoria)
                        ? productData.idCategoria
                        : parent.subcategorias?.[0]?.id || "";

                    setSelectedSubcategoryId(subId);
                }
            } catch (err) {
                console.error(err);
            }
        }
        loadCategories();
    }, [productData, show]);

    if (!show) return null;

    if (loading) {
        return (
            <Modal show={show} title="Editar Produto" onClose={onClose}>
                <div style={{ padding: '20px', textAlign: 'center', color: '#4a5568' }}>Carregando produto...</div>
            </Modal>
        );
    }

    const currentParent = parents.find(p => p.id === selectedParentId) || {};
    const subcategories = currentParent.subcategorias || [];

    const handleParentChange = e => {
        const newParentId = Number(e.target.value);
        setSelectedParentId(newParentId);
        const parent = parents.find(p => p.id === newParentId);
        if (!parent) {
            setTipoForm("outros");
            setSelectedSubcategoryId("");
            return;
        }
        setTipoForm(parent.descricao.toLowerCase() === "calçados" ? "calcado" : "outros");
        setSelectedSubcategoryId(parent.subcategorias?.[0]?.id || "");
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setProductData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let updatedProduct;

            if (tipoForm === "calcado") {
                updatedProduct = await ProductService.updateCalcado(productData.id, productData);
            } else {
                updatedProduct = await ProductService.updateOutros(productData.id, productData);
            }

            console.log("Produto atualizado:", updatedProduct);
            onSaved(); // Atualiza a tabela na tela de trás
            onClose(); // Fecha a modal
        } catch (err) {
            console.error("Erro ao atualizar produto:", err);
            alert("Erro ao atualizar o produto. Verifique os dados.");
        }
    };

    // Estilos reutilizáveis para não poluir o HTML
    const labelStyle = { fontWeight: '600', color: '#4a5568', fontSize: '14px', margin: 0 };
    const inputStyle = { padding: '10px 14px', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: '#f7fafc', outline: 'none', color: '#2d3748', fontSize: '14px', width: '100%', boxSizing: 'border-box' };

    return (
        <Modal show={show} title={`Editar Produto #${productData.id || ''}`} onClose={onClose}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
                
                {/* Linha 1: Categorias */}
                <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                        <label style={labelStyle}>Categoria Principal</label>
                        <select value={selectedParentId} onChange={handleParentChange} style={inputStyle}>
                            <option value="" disabled>Selecione</option>
                            {parents.map(p => (
                                <option key={p.id} value={p.id}>{p.descricao}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                        <label style={labelStyle}>Subcategoria</label>
                        <select
                            value={selectedSubcategoryId}
                            onChange={e => setSelectedSubcategoryId(Number(e.target.value))}
                            style={inputStyle}
                        >
                            <option value="" disabled>Selecione</option>
                            {subcategories.map(sc => (
                                <option key={sc.id} value={sc.id}>{sc.descricao}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {tipoForm === "calcado" ? (
                    <>
                        {/* Linha: Marca e Modelo */}
                        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                                <label style={labelStyle}>Marca</label>
                                <input name="marca" value={productData.marca || ""} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                                <label style={labelStyle}>Modelo</label>
                                <input name="modelo" value={productData.modelo || ""} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>
                        
                        {/* Linha: Número e Cor */}
                        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                                <label style={labelStyle}>Número</label>
                                <input type="number" name="numero" value={productData.numero || ""} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                                <label style={labelStyle}>Cor</label>
                                <input name="cor" value={productData.cor || ""} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>
                        
                        {/* Linha: Quantidade e Preço */}
                        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                                <label style={labelStyle}>Quantidade</label>
                                <input type="number" name="quantidade" value={productData.quantidade || ""} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                                <label style={labelStyle}>Valor Unitário (R$)</label>
                                <input type="number" step="0.01" name="valorUnitario" value={productData.valorUnitario || ""} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Outros: Nome */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={labelStyle}>Nome do Produto</label>
                            <input name="nome" value={productData.nome || ""} onChange={handleChange} style={inputStyle} />
                        </div>
                        
                        {/* Outros: Descrição */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={labelStyle}>Descrição</label>
                            <input name="descricao" value={productData.descricao || ""} onChange={handleChange} style={inputStyle} />
                        </div>
                        
                        {/* Linha: Quantidade e Preço */}
                        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                                <label style={labelStyle}>Quantidade</label>
                                <input type="number" name="quantidade" value={productData.quantidade || ""} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                                <label style={labelStyle}>Valor Unitário (R$)</label>
                                <input type="number" step="0.01" name="valorUnitario" value={productData.valorUnitario || ""} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>
                    </>
                )}

                {/* Rodapé com botões de ação */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                    <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#e2e8f0', color: '#4a5568', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                        Cancelar
                    </button>
                    <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#ed64a6', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                        Salvar Alterações
                    </button>
                </div>
                
            </form>
        </Modal>
    );
}