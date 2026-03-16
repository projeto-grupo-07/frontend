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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
      
      {/* Marca e Modelo */}
      <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Marca</label>
          <input value={marca} onChange={(e) => setMarca(e.target.value)} required placeholder="Ex: Nike" />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Modelo</label>
          <input value={modelo} onChange={(e) => setModelo(e.target.value)} required placeholder="Ex: Revolution" />
        </div>
      </div>

      {/* Número e Cor */}
      <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Número</label>
          <input type="number" value={numero} onChange={(e) => setNumero(e.target.value)} required placeholder="Ex: 42" />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Cor</label>
          <input value={cor} onChange={(e) => setCor(e.target.value)} required placeholder="Ex: Preto" />
        </div>
      </div>

      {/* Quantidade e Valor */}
      <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Quantidade</label>
          <input type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Valor Unitário (R$)</label>
          <input type="number" step="0.01" min="0" value={valorUnitario} onChange={(e) => setValorUnitario(e.target.value)} required placeholder="0.00" />
        </div>
      </div>

      <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
        <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#e2e8f0', color: '#4a5568', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
        <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#ed64a6', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Criar Produto</button>
      </div>
      
    </form>
  );
}