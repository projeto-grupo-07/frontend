import './styles.css'
import { Navbar } from "../../components/specific/Navbar";
import { useState, useEffect } from 'react';
import { ProductService } from '../../services/ProdutoService';
import ModalBuscaProduto from '../../components/common/ModalBuscaProduto'
import CreateProductModal from '../../components/common/CreateProductModal'
import { VendaService } from '../../services/VendaService';
import FinalizarVendaModal from '../../components/common/FinalizarVendaModal';

function PainelDeVendas() {
    const [produtos, setProdutos] = useState([]);
    const [itensVenda, setItensVenda] = useState(() => {
        // Busca os dados salvos no navegador
        const dadosSalvos = localStorage.getItem('@BrinksCalcados:carrinho');
        // Se houver dados, converte de String para Objeto; se não, inicia vazio
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

            // SUCESSO:
            alert("Venda realizada com sucesso!");
            setItensVenda([]); // Limpa a tabela
            localStorage.removeItem('@BrinksCalcados:carrinho'); // Limpa o cache
            setModalFinalizarAberto(false); // Fecha o modal
        } catch (err) {
            alert("Erro ao processar venda no servidor.");
        }
    };




    const handleSelecionarProduto = (produto) => {
        setProdutoSelecionado(produto);
        setModalAberto(false);
    };

    const handleProdutoCriado = () => {
        fetchProdutos(); // Isso recarrega a lista do seu backend
        setModalCadastroAberto(false); // Fecha o modal de cadastro
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
    if (!produtoSelecionado) return alert("Selecione um produto primeiro!");

    const descricao = `${produtoSelecionado.marca} ${produtoSelecionado.modelo} - Nº ${produtoSelecionado.numero}`;

    const novoItem = {
        // Mudamos os nomes das chaves para bater com o DTO do seu Backend
        idProduto: produtoSelecionado.id, 
        nome: descricao, 
        quantidadeVendaProduto: Number(quantidade),
        valorTotalVendaProduto: (produtoSelecionado.valorUnitario || 0) * quantidade,
        // Mantemos 'total' e 'preco' apenas se você os usar para exibir na tabela do painel
        preco: produtoSelecionado.valorUnitario || 0,
        total: (produtoSelecionado.valorUnitario || 0) * quantidade
    };

    setItensVenda([...itensVenda, novoItem]);
    setProdutoSelecionado(null);
    setQuantidade(1);
};

    const removerItem = (index) => {
        const novaLista = itensVenda.filter((_, i) => i !== index);
        setItensVenda(novaLista);
    };

    useEffect(() => {
        fetchProdutos()
    }, [])

    useEffect(() => {
        localStorage.setItem('@BrinksCalcados:carrinho', JSON.stringify(itensVenda));
    }, [itensVenda]); // Executa sempre que a lista de itens mudar

    return (
        <> {/* CORRIGIDO: Usando Fragment ao invés de <h1> */}
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
                                            // GARANTIA: Se não houver nome ou produto, fica string vazia
                                            value={produtoSelecionado ? `${produtoSelecionado.marca} ${produtoSelecionado.modelo}` : ''}
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
                                    <label>Qtd.</label>
                                    <input
                                        type="number"
                                        className="custom-input"
                                        // GARANTIA: Nunca deixa o value ser undefined
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
                                        <th>Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itensVenda.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.nome}</td>
                                            <td>{item.quantidade}</td>
                                            <td>R$ {item.preco.toFixed(2)}</td>
                                            <td>R$ {item.total.toFixed(2)}</td>
                                            <td>
                                                <button className="btn-delete" onClick={() => removerItem(index)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {itensVenda.length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Nenhum item adicionado</td>
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