import React, { useEffect, useState } from "react";
import { ProductService } from "../../../services/ProdutoService";

export default function FormCalcado({
  subcategories = [],
  subcategoryId,
  setSubcategoryId,
  onClose,
  onCreated
}) {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [numero, setNumero] = useState("");
  const [cor, setCor] = useState("");
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
      quantidade: Number(quantidade),
      valorUnitario: Number(valorUnitario),
      marca,
      modelo,
      numero: Number(numero),
      cor
    };

    try {
      await ProductService.createProduct(payload);
      if (onCreated) onCreated();
      if (onClose) onClose();
    } catch (err) {
      console.error("Erro ao criar calçado:", err);
      alert(err.response?.data?.message || "Erro ao cadastrar calçado.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Marca</label>
        <input value={marca} onChange={(e) => setMarca(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Modelo</label>
        <input value={modelo} onChange={(e) => setModelo(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Número</label>
        <input type="number" value={numero} onChange={(e) => setNumero(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Cor</label>
        <input value={cor} onChange={(e) => setCor(e.target.value)} required />
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
