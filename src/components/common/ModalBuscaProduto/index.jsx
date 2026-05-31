import React, { useState } from 'react'; 
import './styles.css'; 

const ModalBuscaProduto = ({ produtos, onSelect, onClose }) => {
    const [filtro, setFiltro] = useState('');

    const getNomeExibicao = (p) => {
        if (!p) return "";
        if (p.tipo === "calcado" || (p.marca && p.modelo)) {
            return `${p.marca} ${p.modelo} ${p.cor ? `- ${p.cor}` : ''} ${p.numero ? `(Nº ${p.numero})` : ''}`;
        }

        if (p.nome) {
            return p.nome;
        }

        return p.categoriaPai || "Produto sem nome";
    };

    const listaSegura = Array.isArray(produtos) ? produtos : [];

    const filtrados = listaSegura.filter(p => {
        const nomeCompleto = getNomeExibicao(p).toLowerCase();
        const correspondeAoFiltro = nomeCompleto.includes(filtro.toLowerCase());
        const temEstoque = p.quantidade && p.quantidade > 0; 

        return correspondeAoFiltro && temEstoque;
    });

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Buscar Produto</h3>
                <input
                    type="text"
                    autoFocus
                    className="modal-search-input"
                    placeholder="Busque por marca, modelo ou cor..."
                    onChange={(e) => setFiltro(e.target.value)}
                />
                <div className="lista-produtos">
                    {filtrados.map(p => (
                        <div key={p.id} onClick={() => onSelect(p)} className="produto-item">
                            <span>{getNomeExibicao(p)}</span>
                            <div className="produto-badges" style={{ display: 'flex', gap: '8px' }}>
                                {/* 🔴 NOVO: Badge indicando a quantidade de estoque disponível */}
                                <span className="produto-estoque-badge" style={{ backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                                    Qtd: {p.quantidade}
                                </span>
                                <span className="produto-preco-badge">
                                    R$ {p.valorUnitario?.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                    {filtrados.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>
                            Nenhum produto disponível em estoque encontrado.
                        </div>
                    )}
                </div>
                <button className="btn-fechar-modal" onClick={onClose}>Fechar</button>
            </div>
        </div>
    );
};

export default ModalBuscaProduto;