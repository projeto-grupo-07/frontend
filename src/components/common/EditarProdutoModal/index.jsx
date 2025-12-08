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
                <div>Carregando produto...</div>
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

    if (productData.tipo === "calcado") {
      updatedProduct = await ProductService.updateCalcado(productData.id, productData);
    } else {
      updatedProduct = await ProductService.updateOutros(productData.id, productData);
    }

    console.log("Produto atualizado:", updatedProduct);
    onClose(); 
     onSaved(); 
    fetchProducts(); 
  } catch (err) {
    console.error("Erro ao atualizar produto:", err);
  }
};

    return (
        <Modal show={show} title="Editar Produto" onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Categoria Principal</label>
                    <select value={selectedParentId} onChange={handleParentChange}>
                        <option value="" disabled>Selecione</option>
                        {parents.map(p => (
                            <option key={p.id} value={p.id}>{p.descricao}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Subcategoria</label>
                    <select
                        value={selectedSubcategoryId}
                        onChange={e => setSelectedSubcategoryId(Number(e.target.value))}
                    >
                        <option value="" disabled>Selecione</option>
                        {subcategories.map(sc => (
                            <option key={sc.id} value={sc.id}>{sc.descricao}</option>
                        ))}
                    </select>
                </div>

                {tipoForm === "calcado" ? (
                    <>
                        <div className="form-group">
                            <label>Marca</label>
                            <input name="marca" value={productData.marca || ""} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Modelo</label>
                            <input name="modelo" value={productData.modelo || ""} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Número</label>
                            <input type="number" name="numero" value={productData.numero || ""} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Cor</label>
                            <input name="cor" value={productData.cor || ""} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Quantidade</label>
                            <input type="number" name="quantidade" value={productData.quantidade || ""} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Preço</label>
                            <input type="number" step="0.01" name="valorUnitario" value={productData.valorUnitario || ""} onChange={handleChange} />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="form-group">
                            <label>Nome</label>
                            <input name="nome" value={productData.nome || ""} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Descrição</label>
                            <input name="descricao" value={productData.descricao || ""} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Quantidade</label>
                            <input type="number" name="quantidade" value={productData.quantidade || ""} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Preço</label>
                            <input type="number" step="0.01" name="valorUnitario" value={productData.valorUnitario || ""} onChange={handleChange} />
                        </div>
                    </>
                )}

                <div style={{ marginTop: "16px" }}>
                    <button type="submit">Salvar</button>
                </div>
            </form>
        </Modal>
    );
}
