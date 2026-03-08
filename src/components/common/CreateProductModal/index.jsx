import React, { useEffect, useState } from "react";
import { CategoriesService } from "../../../services/CategoriaService";
import { Modal } from "../Modal";
import FormCalcado from "../FormCalcado";
import FormOutros from "../FormOutros";
import "./styles.css";

export default function CreateProductModal({ show, onClose, onCreated }) {
  const [parents, setParents] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [tipoForm, setTipoForm] = useState("outros");
  const [loadingParents, setLoadingParents] = useState(false);

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
          setTipoForm(first.descricao.toLowerCase() === "calçados" ? "calcado" : "outros");

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
      setTipoForm("outros");
      setSelectedSubcategoryId("");
      return;
    }

    setTipoForm(parent.descricao.toLowerCase() === "calçados" ? "calcado" : "outros");

    const firstSub = Array.isArray(parent.subcategorias) && parent.subcategorias.length > 0
      ? parent.subcategorias[0].id
      : "";
    setSelectedSubcategoryId(firstSub);
  };

  if (!show) return null;

  const currentParent = parents.find(p => p.id === Number(selectedParentId)) ?? null;
  const subcategories = currentParent?.subcategorias ?? [];

  return (
    <div className="create-product-modal">
      <Modal show={show} title="Registrar Produto" onClose={onClose}>
        <div className="form-group">
          <label>Categoria Principal</label>
          <select value={selectedParentId} onChange={handleParentChange} required disabled={loadingParents}>
            <option value="" disabled>{loadingParents ? "Carregando..." : "Selecione"}</option>
            {parents.map(p => (
              <option key={p.id} value={p.id}>{p.descricao}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
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
        </div>

        {tipoForm === "calcado" ? (
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
      </Modal>
    </div>
  );
}