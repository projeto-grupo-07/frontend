import './styles.css';
import { Navbar } from "../../components/specific/Navbar";
import { useState, useEffect } from 'react';
import { ProductService } from '../../services/ProdutoService';
import ModalBuscaProduto from '../../components/common/ModalBuscaProduto';
import CreateProductModal from '../../components/common/CreateProductModal';
import { VendaService } from '../../services/VendaService';
import FinalizarVendaModal from '../../components/common/FinalizarVendaModal';

function PainelDeVendas() {
    const [produtos, setProdutos] = useState([]);
    const [itensVenda, setItensVenda] = useState(() => {
        const dadosSalvos = localStorage.getItem('@BrinksCalcados:carrinho');
        return dadosSalvos ? JSON.parse(dadosSalvos) : [];
    });
    const [loading, setLoading] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [quantidade, setQuantidade] = useState(1);
    const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
    const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false);

    const handleConfirmarVenda = async (dadosVenda) => {
        try {
            await VendaService.create(dadosVenda);
            alert("Venda realizada com sucesso!");
            setItensVenda([]);
            localStorage.removeItem('@BrinksCalcados:carrinho');
            setModalFinalizarAberto(false);
        } catch (err) {
            const msg = err.response?.data?.message
                || err.response?.data?.error
                || "Erro ao processar venda no servidor.";
            alert(msg);
        }
    };

    const handleSelecionarProduto = (produto) => {
        setProdutoSelecionado(produto);
        setModalAberto(false);
    };

    const handleProdutoCriado = () => {
        fetchProdutos();
        setModalCadastroAberto(false);
        alert("Produto cadastrado com sucesso e pronto para venda!");
    };

    const fetchProdutos = async () => {
        try {
            setLoading(true);
            const produtosRaw = await ProductService.getAll();
            const safeProdutos = Array.isArray(produtosRaw) ? produtosRaw : [];
            setProdutos(safeProdutos);
        } catch (err) {
            console.error("Erro ao buscar produtos:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdicionarItem = () => {
    if (!produtoSelecionado || !quantidade) return;

    const novoItem = {
        idProduto: produtoSelecionado.id,
        // Normaliza o nome aqui! Se não tiver nome (Outros), monta com marca/modelo
        nome: produtoSelecionado.nome || `${produtoSelecionado.marca} ${produtoSelecionado.modelo}`,
        quantidadeVendaProduto: parseInt(quantidade),
        preco: produtoSelecionado.valorUnitario,
        desconto: 0,
        total: produtoSelecionado.valorUnitario * parseInt(quantidade),
        // Mantenha marca e modelo se precisar deles para outra coisa
        marca: produtoSelecionado.marca,
        modelo: produtoSelecionado.modelo
    };

    setItensVenda([...itensVenda, novoItem]);
    
    // Limpar seleção após adicionar
    setProdutoSelecionado(null);
    setQuantidade("");
};

    // FUNÇÃO QUE ESTAVA FALTANDO
    const handleAtualizarDesconto = (index, novoDesconto) => {
        const valorDesconto = Number(novoDesconto);

        if (valorDesconto < 0) return;

        const novaLista = [...itensVenda];
        const item = novaLista[index];

        const subtotalBruto = item.preco * item.quantidadeVendaProduto;

        if (valorDesconto > subtotalBruto) {
            alert(`O desconto não pode ser maior que o subtotal bruto do item (R$ ${subtotalBruto.toFixed(2)}).`);
            return;
        }

        item.desconto = valorDesconto;
        item.total = subtotalBruto - valorDesconto;

        setItensVenda(novaLista);
    };

    const removerItem = (index) => {
        const novaLista = itensVenda.filter((_, i) => i !== index);
        setItensVenda(novaLista);
    };

    useEffect(() => {
        fetchProdutos();
    }, []);

    useEffect(() => {
        localStorage.setItem('@BrinksCalcados:carrinho', JSON.stringify(itensVenda));
    }, [itensVenda]);

    return (
        <>
            {modalAberto && (
                <ModalBuscaProduto
                    produtos={produtos}
                    onSelect={handleSelecionarProduto}
                    onClose={() => setModalAberto(false)}
                />
            )}

            <CreateProductModal
                show={modalCadastroAberto}
                onClose={() => setModalCadastroAberto(false)}
                onCreated={handleProdutoCriado}
            />

            <main className="painel-container">
                <div className="painel-content">
                    <section className="card-cadastro">
                        <div className="card-header rosa">
                            <h3>Cadastro de Vendas</h3>
                        </div>

                        <div className="card-body">
                            <div className="input-group-row">
                                <div className="input-field">
                                    <label>Produto</label>
                                    <div className="input-busca-container" onClick={() => setModalAberto(true)}>
                                        <input
                                            type="text"
                                            readOnly
                                            placeholder="Clique para buscar um produto..."
                                            value={
                                                produtoSelecionado
                                                    ? (produtoSelecionado.nome || `${produtoSelecionado.marca} ${produtoSelecionado.modelo}`)
                                                    : ''
                                            }
                                            className="custom-input cursor-pointer"
                                        />
                                    </div>
                                    <span
                                        className="helper-link"
                                        onClick={() => setModalCadastroAberto(true)}
                                    >
                                        Cadastrar novo Produto
                                    </span>
                                </div>

                                <div className="input-field quantity">
                                    <label>Qtd. (Disponível: {produtoSelecionado?.quantidade || 0})</label>
                                    <input
                                        type="number"
                                        className="custom-input"
                                        min="1"
                                        max={produtoSelecionado?.quantidade || 999}
                                        value={quantidade || ''}
                                        onChange={(e) => setQuantidade(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button className="btn-adicionar" onClick={handleAdicionarItem}>
                                Adicionar Item
                            </button>
                        </div>
                    </section>

                    <section className="card-itens">
                        <div className="card-header azul">
                            <h3>Itens da Venda</h3>
                        </div>

                        <div className="card-body no-padding">
                            <table className="vendas-table">
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Qtd</th>
                                        <th>Preço</th>
                                        <th>Desconto (R$)</th>
                                        <th>Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itensVenda.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.nome || `${item.marca} ${item.modelo}`}</td>
                                            <td>{item.quantidadeVendaProduto}</td>
                                            <td>R$ {item.preco.toFixed(2)}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.desconto === 0 ? '' : item.desconto}
                                                    placeholder="0.00"
                                                    onChange={(e) => handleAtualizarDesconto(index, e.target.value)}
                                                    className="input-desconto"
                                                    style={{ width: '80px', padding: '4px' }}
                                                />
                                            </td>
                                            <td>R$ {item.total.toFixed(2)}</td>
                                            <td>
                                                <button className="btn-delete" onClick={() => removerItem(index)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {itensVenda.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Nenhum item adicionado</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="card-footer">
                                <div className="valor-total-venda">
                                    Total: R$ {itensVenda.reduce((acc, item) => acc + item.total, 0).toFixed(2)}
                                </div>
                                <button
                                    className="btn-concluir"
                                    onClick={() => setModalFinalizarAberto(true)}
                                    disabled={itensVenda.length === 0}
                                >
                                    Concluir Venda
                                </button>
                                <FinalizarVendaModal
                                    show={modalFinalizarAberto}
                                    onClose={() => setModalFinalizarAberto(false)}
                                    onConfirm={handleConfirmarVenda}
                                    itensVenda={itensVenda}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

export default PainelDeVendas;