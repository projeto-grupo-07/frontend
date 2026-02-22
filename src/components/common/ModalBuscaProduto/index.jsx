import React, { useState } from 'react'; // Adicionado
import './styles.css'; // Corrigido (ponto antes da barra)

const ModalBuscaProduto = ({ produtos, onSelect, onClose }) => {
    const [filtro, setFiltro] = useState('');

    // Função para criar o nome de exibição baseado no tipo de produto
    const getNomeExibicao = (p) => {
        if (!p) return "";
        // Se for calçado, montamos: "Marca Modelo - Cor (Nº 00)"
        if (p.marca && p.modelo) {
            return `${p.marca} ${p.modelo} - ${p.cor || ''} (Nº ${p.numero || ''})`;
        }
        // Caso seja da classe "Outros" e tenha uma categoria ou descrição
        return p.categoria?.nome || "Produto sem nome";
    };

    const listaSegura = Array.isArray(produtos) ? produtos : [];

    const filtrados = listaSegura.filter(p => {
        const nomeCompleto = getNomeExibicao(p).toLowerCase();
        return nomeCompleto.includes(filtro.toLowerCase());
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
                            <span className="produto-preco-badge">
                                R$ {p.valorUnitario?.toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
                <button className="btn-fechar-modal" onClick={onClose}>Fechar</button>
            </div>
        </div>
    );
};

export default ModalBuscaProduto;