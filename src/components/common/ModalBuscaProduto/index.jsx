import React, { useState } from 'react'; // Adicionado
import './styles.css'; // Corrigido (ponto antes da barra)

const ModalBuscaProduto = ({ produtos, onSelect, onClose }) => {
    const [filtro, setFiltro] = useState('');

    const getNomeExibicao = (p) => {
        if (!p) return "";

        // Lógica para Calçados (que possuem marca e modelo)
        if (p.tipo === "calcado" || (p.marca && p.modelo)) {
            return `${p.marca} ${p.modelo} ${p.cor ? `- ${p.cor}` : ''} ${p.numero ? `(Nº ${p.numero})` : ''}`;
        }

        // Lógica para Outros (que possuem a propriedade 'nome')
        if (p.nome) {
            return p.nome;
        }

        // Fallback caso não encontre nenhuma das opções acima
        return p.categoriaPai || "Produto sem nome";
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
                            <div className="produto-badges">
                                <span className="produto-preco-badge">
                                    R$ {p.valorUnitario?.toFixed(2)}
                                </span>

                            </div>
                        </div>
                    ))}
                </div>
                <button className="btn-fechar-modal" onClick={onClose}>Fechar</button>
            </div>
        </div>
    );
};

export default ModalBuscaProduto;