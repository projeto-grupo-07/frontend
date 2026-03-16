import React from 'react';
import './styles.css'; 

function DetalhesVendaModal({ show, onClose, venda }) {
    if (!show || !venda) return null;

    const totalDesconto = venda.itensDaVenda?.reduce((acc, item) => acc + (item.desconto || 0), 0) || 0;

    const formatarNomeProduto = (produto) => {
        if (!produto) return "Produto não encontrado";
        const nomePrincipal = produto.marca || produto.nome || "";
        const detalhe = produto.modelo || produto.descricao || "";
        const numeroFormatado = (produto.numero && produto.numero > 0) ? ` (Nº ${produto.numero})` : "";
        return `${nomePrincipal} ${detalhe}${numeroFormatado}`.trim();
    };

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
                        <p><strong>Data:</strong> {venda.dataExibicao}</p> 
                        <p><strong>Pagamento:</strong> {venda.formaPagamento}</p>
                    </div>

                    <table className="itens-venda-table">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Qtd</th>
                                <th>Unit.</th>
                                <th>Desconto</th>
                                <th>Total Líquido</th>
                            </tr>
                        </thead>
                        <tbody>
                            {venda.itensDaVenda?.map((item) => (
                                <tr key={item.id}>
                                    {/* AQUI ESTÁ A CORREÇÃO: Usando a função para exibir o nome */}
                                    <td>{formatarNomeProduto(item.produto)}</td>
                                    
                                    <td>{item.quantidadeVendaProduto}</td>
                                    <td>R$ {item.produto.valorUnitario?.toFixed(2).replace('.', ',')}</td>
                                    <td style={{ color: item.desconto > 0 ? '#e53e3e' : 'inherit' }}>
                                        R$ {(item.desconto || 0).toFixed(2).replace('.', ',')}
                                    </td>
                                    <td>R$ {item.valorTotalVendaProduto?.toFixed(2).replace('.', ',')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <footer className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        {totalDesconto > 0 && (
                            <span style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>
                                Descontos Aplicados: - R$ {totalDesconto.toFixed(2).replace('.', ',')}
                            </span>
                        )}
                        <div className="total-destaque">
                            Total Final: {venda.valorTotalExibicao}
                        </div>
                    </div>
                    <button className="btn-fechar" onClick={onClose}>Fechar</button>
                </footer>
            </div>
        </div>
    );
}

export default DetalhesVendaModal;