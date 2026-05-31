import './styles.css';
import { FiEdit, FiTrash } from "react-icons/fi";
import { useState, useEffect } from 'react';
import { TableContainer } from '../../components/specific/TableContainer';
import Button from '../../components/common/Button';
import { IconButton } from '../../components/common/IconButton';
import { SearchBar } from '../../components/common/SearchBar';
import { ProductService } from '../../services/ProdutoService';
import { DataTable } from '../../components/common/DataTable';
import CreateProductModal from "../../components/common/CreateProductModal";
import FilterModal from "../../components/common/FilterModal";
import { CategoriesService } from "../../services/CategoriaService";
import EditarProdutoModal from "../../components/common/EditarProdutoModal";

const TAMANHO_PAGINA = 5;

function Produtos() {
    const [produtos, setProdutos] = useState([]);
    const [colunas, setColunas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [verTodos, setVerTodos] = useState(false);
    const [tamanhoPagina, setTamanhoPagina] = useState(15)

    // ESTADOS DE FILTRO (Arrays para múltipla escolha)
    const [filtrosCategorias, setFiltrosCategorias] = useState([]);
    const [filtrosSubcategorias, setFiltrosSubcategorias] = useState([]);
    const [filtrosMarcas, setFiltrosMarcas] = useState([]);
    const [filtroNome, setFiltroNome] = useState("");
    const [precoMin, setPrecoMin] = useState("");
    const [precoMax, setPrecoMax] = useState("");

    // ESTADOS DE PAGINAÇÃO
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalElementos, setTotalElementos] = useState(0);

    const [categorias, setCategorias] = useState([]);

    const [idEditando, setIdEditando] = useState(null);
    function abrirEditar(id) {
        setIdEditando(id);
    }

    const fetchProdutos = async (pagina = 0, isAll = verTodos) => {
        try {
            setLoading(true);

            let produtosPreparados = [];

            if (isAll) {
                // Busca TODOS os registros (sem paginação)
                // Obs: Certifique-se de que ProductService.getAll() existe no seu frontend
                const dados = await ProductService.getAll();
                const safeDados = Array.isArray(dados) ? dados : [];

                produtosPreparados = safeDados.map(p => ({
                    ...p,
                    nomeMarca: p.marca || p.nome || "-",
                    modeloDescricao: p.modelo || p.descricao || "-",
                }));

                setPaginaAtual(0);
                setTotalPaginas(1);
                setTotalElementos(produtosPreparados.length);

            } else {
                const dados = await ProductService.getPaginated(pagina, tamanhoPagina);
                produtosPreparados = (dados.conteudo || []).map(p => ({
                    ...p,
                    nomeMarca: p.marca || p.nome || "-",
                    modeloDescricao: p.modelo || p.descricao || "-",
                }));

                setPaginaAtual(dados.pagina ?? pagina);
                setTotalPaginas(dados.totalPaginas ?? 1);
                setTotalElementos(dados.total ?? 0);
            }

            setProdutos(produtosPreparados);

        } catch (err) {
            console.error("Erro ao buscar produtos:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMudarTamanhoPagina = (e) => {
        const novoTamanho = Number(e.target.value);
        setTamanhoPagina(novoTamanho);
        setTimeout(() => fetchProdutos(0, verTodos, novoTamanho), 0);
    };

    const handleToggleVerTodos = () => {
        const novoStatus = !verTodos;
        setVerTodos(novoStatus);
        fetchProdutos(0, novoStatus);
    };

    const handleAplicarTamanho = () => {
        let novoTamanho = Number(tamanhoPagina);

        if (novoTamanho < 1) {
            novoTamanho = 1;
            setTamanhoPagina(1);
        } else if (novoTamanho > 1000) {
            novoTamanho = 1000;
            setTamanhoPagina(1000);
        }

        fetchProdutos(0, verTodos, novoTamanho);
    };

    useEffect(() => {
        const loadCategorias = async () => {
            try {
                const list = await CategoriesService.getParentCategories();
                const safeList = Array.isArray(list) ? list : [];
                setCategorias(safeList);
            } catch (err) {
                console.error("Erro ao buscar categorias:", err);
            }
        };
        loadCategorias();
        fetchProdutos(0);
    }, []);

    // Lógica das colunas baseada no filtro ativo
    const atualizarColunas = () => {
        if (filtrosCategorias.length === 1 && filtrosCategorias[0].toLowerCase() === "calçados") {
            setColunas([
                { header: "Marca", accessor: "marca" },
                { header: "Modelo", accessor: "modelo" },
                { header: "Número", accessor: "numero" },
                { header: "Cor", accessor: "cor" },
                { header: "Preço", accessor: "valorUnitario" },
                { header: "Categoria", accessor: "categoriaPai" },
            ]);
        } else if (filtrosCategorias.length === 1 && filtrosCategorias[0].toLowerCase() === "outros") {
            setColunas([
                { header: "Nome", accessor: "nome" },
                { header: "Descrição", accessor: "descricao" },
                { header: "Preço", accessor: "valorUnitario" },
                { header: "Categoria", accessor: "categoriaPai" },
            ]);
        } else {
            setColunas([
                { header: "Nome/Marca", accessor: "nomeMarca" },
                { header: "Modelo/Descrição", accessor: "modeloDescricao" },
                { header: "Número", accessor: "numero" },
                { header: "Cor", accessor: "cor" },
                { header: "Preço", accessor: "valorUnitario" },
                { header: "Categoria", accessor: "categoriaPai" },
            ]);
        }
    };

    useEffect(() => {
        atualizarColunas();
    }, [filtrosCategorias]);

    // Filtros client-side aplicados na página atual
    const dadosFiltrados = produtos
        .filter(p => {
            if (filtrosCategorias.length > 0) {
                const catProduto = String(p.categoriaPai || p.tipo || "").toLowerCase();
                const passou = filtrosCategorias.some(catFiltro =>
                    catProduto === catFiltro.toLowerCase() || catProduto.includes(catFiltro.toLowerCase())
                );
                if (!passou) return false;
            }

            if (filtrosSubcategorias.length > 0 && !filtrosSubcategorias.includes(String(p.idCategoria))) {
                return false;
            }

            if (filtrosMarcas.length > 0 && p.marca && !filtrosMarcas.includes(p.marca)) {
                return false;
            }

            if (filtroNome) {
                const termo = filtroNome.toLowerCase();
                const bate =
                    (p.nome && p.nome.toLowerCase().includes(termo)) ||
                    (p.modelo && p.modelo.toLowerCase().includes(termo)) ||
                    (p.marca && p.marca.toLowerCase().includes(termo)) ||
                    (p.descricao && p.descricao.toLowerCase().includes(termo));
                if (!bate) return false;
            }

            const preco = Number(p.valorUnitario) || 0;
            if (precoMin && preco < Number(precoMin)) return false;
            if (precoMax && preco > Number(precoMax)) return false;

            return true;
        })
        .map(p => {
            return {
                ...p,
                nomeMarca: p.marca || p.nome || "-",
                modeloDescricao: p.modelo || p.descricao || "-",
            };
        });

    const aplicarFiltros = (e) => {
        e.preventDefault();
        setIsFilterOpen(false);
        fetchProdutos(0);
    };

    const limparFiltros = () => {
        setFiltrosCategorias([]);
        setFiltrosSubcategorias([]);
        setFiltrosMarcas([]);
        setFiltroNome("");
        setPrecoMin("");
        setPrecoMax("");
        setIsFilterOpen(false);
        fetchProdutos(0);
    };

    async function handleDelete(produto) {
        console.log("DELETE PRODUTO:", produto);
        if (!produto?.id) {
            console.error("Produto sem ID:", produto);
            alert("Erro: produto inválido");
            return;
        }

        if (!window.confirm("Você tem certeza que quer deletar esse produto?")) return;

        try {
            setLoading(true);
            await ProductService.delete(produto.id);
            fetchProdutos(paginaAtual);
        } catch (err) {
            alert(err.response?.data?.message || "Não foi possível deletar o produto.");
        } finally {
            setLoading(false);
        }
    }

    const irParaPagina = (pagina) => {
        if (pagina >= 0 && pagina < totalPaginas && pagina !== paginaAtual) {
            fetchProdutos(pagina);
        }
    };

    const paginasVisiveis = () => {
        const paginas = [];
        const inicio = Math.max(0, paginaAtual - 2);
        const fim = Math.min(totalPaginas - 1, paginaAtual + 2);
        for (let i = inicio; i <= fim; i++) {
            paginas.push(i);
        }
        return paginas;
    };

    return (
        <div className="page-container">
            <title>Produtos</title>
            <TableContainer
                header={
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'nowrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '15px',
                        width: '100%',
                        minWidth: '600px',
                        boxSizing: 'border-box'
                    }}>

                        <div style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                            <Button onClick={() => setIsCreateModalOpen(true)}>Adicionar produto</Button>
                        </div>

                        <div style={{ flexGrow: 1, minWidth: '200px' }}>
                            <SearchBar
                                placeholder="Pesquisar..."
                                value={filtroNome}
                                onChange={(e) => setFiltroNome(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, color: '#4A4A4A', fontWeight: '500' }}>
                            <input
                                type="checkbox"
                                id="toggleVerTodos"
                                checked={verTodos}
                                onChange={handleToggleVerTodos}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="toggleVerTodos" style={{ cursor: 'pointer', userSelect: 'none' }}>
                                Ver todos (Filtro Global)
                            </label>
                        </div>

                        <div style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                            <Button onClick={() => setIsFilterOpen(true)}>Filtrar</Button>
                        </div>

                    </div>
                }
            >
                {loading ? (
                    <div className="empty-table-placeholder">Carregando produtos...</div>
                ) : (
                    <>
                        {dadosFiltrados.length > 0 ? (
                            <DataTable
                                columns={colunas}
                                data={dadosFiltrados}
                                actions={(produto) => (
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <IconButton icon={FiEdit} onClick={() => abrirEditar(produto.id)} />
                                        <IconButton icon={FiTrash} onClick={() => handleDelete(produto)} />
                                    </div>
                                )}
                            />
                        ) : (
                            <div className="empty-table-placeholder">Nenhum produto encontrado.</div>
                        )}

                        {!verTodos && totalPaginas > 0 && (
                            <div className="pagination-wrapper">
                                <button
                                    className="btn-paginacao"
                                    disabled={paginaAtual === 0}
                                    onClick={() => irParaPagina(paginaAtual - 1)}
                                >
                                    Anterior
                                </button>

                                {paginaAtual > 2 && (
                                    <>
                                        <button className="btn-paginacao" onClick={() => irParaPagina(0)}>1</button>
                                        {paginaAtual > 3 && <span className="btn-paginacao-separator">...</span>}
                                    </>
                                )}

                                {paginasVisiveis().map(p => (
                                    <button
                                        key={p}
                                        className={`btn-paginacao ${p === paginaAtual ? 'btn-paginacao-ativo' : ''}`}
                                        onClick={() => irParaPagina(p)}
                                    >
                                        {p + 1}
                                    </button>
                                ))}

                                {paginaAtual < totalPaginas - 3 && (
                                    <>
                                        {paginaAtual < totalPaginas - 4 && <span className="btn-paginacao-separator">...</span>}
                                        <button className="btn-paginacao" onClick={() => irParaPagina(totalPaginas - 1)}>{totalPaginas}</button>
                                    </>
                                )}

                                <button
                                    className="btn-paginacao"
                                    disabled={paginaAtual === totalPaginas - 1}
                                    onClick={() => irParaPagina(paginaAtual + 1)}
                                >
                                    Próxima
                                </button>

                                {/* CORREÇÃO: Bloco movido para dentro do pagination-wrapper */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#5D78A9' }}>
                                        <label htmlFor="itensPorPagina">Itens por página:</label>
                                        <input
                                            type="number"
                                            id="itensPorPagina"
                                            min="1"
                                            value={tamanhoPagina}
                                            onChange={(e) => setTamanhoPagina(e.target.value)}
                                            onBlur={handleAplicarTamanho}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAplicarTamanho()}
                                            style={{
                                                width: '60px',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                border: '1px solid #C5D3F7',
                                                outline: 'none',
                                                color: '#2D3E50',
                                                textAlign: 'center'
                                            }}
                                        />
                                    </div>

                                    <span className="btn-paginacao-info">
                                        {totalElementos} produto{totalElementos !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </TableContainer>

            <CreateProductModal
                show={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={() => fetchProdutos(paginaAtual)}
            />

            <FilterModal
                show={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onClear={limparFiltros}
                categorias={categorias}
                marcas={[...new Set(produtos.map(p => p.marca).filter(Boolean))]}
                filtrosCategorias={filtrosCategorias}
                setFiltrosCategorias={setFiltrosCategorias}
                filtrosSubcategorias={filtrosSubcategorias}
                setFiltrosSubcategorias={setFiltrosSubcategorias}
                filtrosMarcas={filtrosMarcas}
                setFiltrosMarcas={setFiltrosMarcas}
                filtroModelo={filtroNome}
                setFiltroModelo={setFiltroNome}
                filtroNome={filtroNome}
                setFiltroNome={setFiltroNome}
                precoMin={precoMin}
                setPrecoMin={setPrecoMin}
                precoMax={precoMax}
                setPrecoMax={setPrecoMax}
                aplicarFiltros={aplicarFiltros}
            />

            <EditarProdutoModal
                show={Boolean(idEditando)}
                idProduto={idEditando}
                onClose={() => setIdEditando(null)}
                onSaved={() => {
                    setIdEditando(null);
                    fetchProdutos(paginaAtual);
                }}
            />
        </div>
    );
}

export default Produtos;
