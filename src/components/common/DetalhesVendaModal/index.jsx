import React from 'react';
import './styles.css'; 

function DetalhesVendaModal({ show, onClose, venda }) {
    if (!show || !venda) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content detalhe-venda-card">
                <header className="modal-header azul">
                    <h3>Detalhes da Venda #{venda.id}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </header>

                <div className="modal-body">
                    <div className="info-venda-topo">
                        <p><strong>Vendedor:</strong> {venda.nomeVendedor}</p>
                        <p><strong>Data:</strong> {venda.dataExibicao}</p> {/* Corrigido: dataExibicao */}
                        <p><strong>Pagamento:</strong> {venda.formaPagamento}</p>
                    </div>

                    <table className="itens-venda-table">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Qtd</th>
                                <th>Unit.</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {venda.itensDaVenda?.map((item) => (
                                <tr key={item.id}>
                                    <td>{`${item.produto.marca} ${item.produto.modelo} (Nº ${item.produto.numero})`}</td>
                                    <td>{item.quantidadeVendaProduto}</td>
                                    <td>R$ {item.produto.valorUnitario?.toFixed(2).replace('.', ',')}</td>
                                    <td>R$ {item.valorTotalVendaProduto?.toFixed(2).replace('.', ',')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <footer className="modal-footer">
                    <div className="total-destaque">
                        Total: {venda.valorTotalExibicao} {/* Corrigido: valorTotalExibicao */}
                    </div>
                    <button className="btn-fechar" onClick={onClose}>Fechar</button>
                </footer>
            </div>
        </div>
    );
}

export default DetalhesVendaModal;