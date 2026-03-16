import React, { useEffect, useState } from "react";
import { CategoriesService } from "../../../services/CategoriaService";
import CreateCategoryModal from "../CreateCategoryModal";
import { Modal } from "../Modal";
import FormCalcado from "../FormCalcado";
import FormOutros from "../FormOutros";
import "./styles.css";

export default function CreateProductModal({ show, onClose, onCreated }) {
  const [parents, setParents] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [loadingParents, setLoadingParents] = useState(false);
  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);

  const handleCategoriaCriada = async () => {
    const list = await CategoriesService.getParentCategories();
    const safeList = Array.isArray(list) ? list : [];
    setParents(safeList);
  };

  useEffect(() => {
    if (!show) return;

    const load = async () => {
      setLoadingParents(true);
      try {
        const list = await CategoriesService.getParentCategories();
        const safeList = Array.isArray(list) ? list : [];
        setParents(safeList);

        if (safeList.length > 0) {
          const first = safeList[0];
          setSelectedParentId(first.id);

          const firstSub = Array.isArray(first.subcategorias) && first.subcategorias.length > 0
            ? first.subcategorias[0].id
            : "";
          setSelectedSubcategoryId(firstSub);
        } else {
          setSelectedParentId("");
          setSelectedSubcategoryId("");
        }
      } catch (err) {
        console.error("Error loading parents:", err);
      } finally {
        setLoadingParents(false);
      }
    };

    load();
  }, [show]);

  const handleParentChange = (e) => {
    const newParentId = Number(e.target.value);
    setSelectedParentId(newParentId);

    const parent = parents.find(p => p.id === newParentId);
    if (!parent) {
      setSelectedSubcategoryId("");
      return;
    }

    const firstSub = Array.isArray(parent.subcategorias) && parent.subcategorias.length > 0
      ? parent.subcategorias[0].id
      : "";
    setSelectedSubcategoryId(firstSub);
  };

  if (!show && !modalCategoriaAberto) return null;

  const currentParent = parents.find(p => p.id === Number(selectedParentId)) ?? null;
  const subcategories = currentParent?.subcategorias ?? [];

  // Variável super blindada para identificar calçados
  const isCalcado = Boolean(
    currentParent && 
    currentParent.descricao && 
    (currentParent.descricao.toLowerCase().includes("calçad") || currentParent.descricao.toLowerCase().includes("calcad"))
  );

  return (
    <>
      {show && (
        <Modal show={show} title="Registrar Produto" onClose={onClose}>
          <div className="create-product-content">
            
            <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Categoria Principal</label>
                <select value={selectedParentId} onChange={handleParentChange} required disabled={loadingParents}>
                  <option value="" disabled>{loadingParents ? "Carregando..." : "Selecione"}</option>
                  {parents.map(p => (
                    <option key={p.id} value={p.id}>{p.descricao}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>Subcategoria</label>
                <select
                  value={selectedSubcategoryId}
                  onChange={(e) => setSelectedSubcategoryId(Number(e.target.value))}
                  required
                >
                  <option value="" disabled>Selecione</option>
                  {subcategories.map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.descricao}</option>
                  ))}
                </select>
                
                <div style={{ textAlign: 'right', marginTop: '4px' }}>
                  <span
                    className="helper-link"
                    onClick={() => setModalCategoriaAberto(true)}
                  >
                    + Cadastrar nova categoria
                  </span>
                </div>
              </div>
            </div>

            {/* O formulário correto é chamado aqui */}
            {isCalcado ? (
              <FormCalcado
                subcategories={subcategories}
                subcategoryId={selectedSubcategoryId}
                setSubcategoryId={setSelectedSubcategoryId}
                onClose={onClose}
                onCreated={onCreated}
              />
            ) : (
              <FormOutros
                subcategories={subcategories}
                subcategoryId={selectedSubcategoryId}
                setSubcategoryId={setSelectedSubcategoryId}
                onClose={onClose}
                onCreated={onCreated}
              />
            )}

          </div>
        </Modal>
      )}

      <CreateCategoryModal
        show={modalCategoriaAberto}
        onClose={() => setModalCategoriaAberto(false)}
        onCreated={handleCategoriaCriada}
      />
    </>
  );
}