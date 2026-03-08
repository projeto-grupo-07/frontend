import React, { useEffect, useState } from "react";
import { ProductService } from "../../../services/ProdutoService";

export default function FormOutros({
  subcategories = [],
  subcategoryId,
  setSubcategoryId,
  onClose,
  onCreated
}) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [valorUnitario, setValorUnitario] = useState("");

  useEffect(() => {
    if ((!subcategoryId || subcategoryId === "") && subcategories.length > 0) {
      setSubcategoryId(subcategories[0].id);
    }
  }, [subcategories, subcategoryId, setSubcategoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subcategoryId) {
      alert("Selecione uma subcategoria.");
      return;
    }

    const payload = {
      idCategoria: Number(subcategoryId),
      nome,
      descricao,
      quantidade: Number(quantidade),
      valorUnitario: Number(valorUnitario)
    };

    try {
      await ProductService.createProduct(payload);
      if (onCreated) onCreated();
      if (onClose) onClose();
    } catch (err) {
      console.error("Erro ao criar produto (outros):", err);
      alert(err.response?.data?.message || "Erro ao cadastrar produto.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Nome</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Descrição</label>
        <input value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Quantidade</label>
        <input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Valor Unitário</label>
        <input type="number" step="0.01" value={valorUnitario} onChange={(e) => setValorUnitario(e.target.value)} required />
      </div>

      <div className="modal-actions">
        <button className="btn-primary" type="submit">Criar</button>
        <button className="btn-secondary" type="button" onClick={onClose}>Cancelar</button>
      </div>
    </form>
  );
}
