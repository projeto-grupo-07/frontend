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

function Produtos() {
    const [produtos, setProdutos] = useState([]);
    const [colunas, setColunas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // ESTADOS DE FILTRO (Agora usando Arrays para múltipla escolha)
    const [filtrosCategorias, setFiltrosCategorias] = useState([]); 
    const [filtrosSubcategorias, setFiltrosSubcategorias] = useState([]);
    const [filtrosMarcas, setFiltrosMarcas] = useState([]);
    const [filtroModelo, setFiltroModelo] = useState("");
    const [filtroNome, setFiltroNome] = useState("");
    const [precoMin, setPrecoMin] = useState("");
    const [precoMax, setPrecoMax] = useState("");

    const [categorias, setCategorias] = useState([]);

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

    const [idEditando, setIdEditando] = useState(null);
    function abrirEditar(id) {
        setIdEditando(id);
    }

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
        fetchProdutos();
    }, []);

    // 1. ATUALIZADA: Lógica das colunas agora verifica o Array
    const atualizarColunas = () => {
        // Só muda para colunas específicas se houver EXATAMENTE UMA categoria marcada
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
            // Se não tem filtro ou tem vários, usa a visão genérica
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

    // 2. MATEMÁTICA DOS FILTROS (Múltipla Escolha)
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

            if (filtroNome && p.nome && !p.nome.toLowerCase().includes(filtroNome.toLowerCase()) && 
                p.modelo && !p.modelo.toLowerCase().includes(filtroNome.toLowerCase())) return false;
        
            const preco = Number(p.valorUnitario) || 0;
            if (precoMin && preco < Number(precoMin)) return false;
            if (precoMax && preco > Number(precoMax)) return false;

            return true;
        })
        .map(p => {
            // Sempre prepara os campos combinados para caso a tabela esteja no modo genérico
            return {
                ...p,
                nomeMarca: p.marca || p.nome || "-",
                modeloDescricao: p.modelo || p.descricao || "-",
            };
        })
        .filter(p => {
            if (!termoBusca.trim()) return true;
            const termo = termoBusca.toLowerCase();
            return Object.values(p)
                .filter(v => typeof v === "string" || typeof v === "number")
                .some(v => String(v).toLowerCase().includes(termo));
        });

    const aplicarFiltros = (e) => {
        e.preventDefault();
        setIsFilterOpen(false);
    };

    // 3. NOVO: Função para zerar o modal
    const limparFiltros = () => {
        setFiltrosCategorias([]);
        setFiltrosSubcategorias([]);
        setFiltrosMarcas([]);
        setFiltroModelo("");
        setFiltroNome("");
        setPrecoMin("");
        setPrecoMax("");
        setTermoBusca(""); 
        setIsFilterOpen(false);
    };

    async function handleDelete(produto) {
        if (!window.confirm("Você tem certeza que quer deletar esse produto?")) return;
        try {
            setLoading(true);
            await ProductService.delete(produto.id || produto);
            fetchProdutos();
        } catch (err) {
            alert(err.response?.data?.message || "Não foi possível deletar o produto.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page-container">
            <title>Produtos</title>
            <TableContainer
                header={
                    <div className="header-actions">
                        <div className="button-wrapper">
                            <Button onClick={() => setIsCreateModalOpen(true)}>Adicionar produto</Button>
                        </div>
                        <div className="search-wrapper">
                            <SearchBar
                                placeholder="Pesquisar em qualquer coluna..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                            />
                        </div>
                        <div className="filters-wrapper">
                            <Button onClick={() => setIsFilterOpen(true)}>Filtrar</Button>
                        </div>
                    </div>
                }
            >
                {loading ? (
                    <div className="empty-table-placeholder">Carregando produtos...</div>
                ) : (
                    dadosFiltrados.length > 0 ? (
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
                    )
                )}
            </TableContainer>

            <CreateProductModal
                show={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={fetchProdutos}
            />

            {/* 4. MODAL DE FILTRO ATUALIZADO */}
            <FilterModal
                show={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onClear={limparFiltros}
                categorias={categorias}
                
                // Mágica: Extrai dinamicamente as marcas dos produtos
                marcas={[...new Set(produtos.map(p => p.marca).filter(Boolean))]}
                
                filtrosCategorias={filtrosCategorias}
                setFiltrosCategorias={setFiltrosCategorias}
                
                filtrosSubcategorias={filtrosSubcategorias}
                setFiltrosSubcategorias={setFiltrosSubcategorias}
                
                filtrosMarcas={filtrosMarcas}
                setFiltrosMarcas={setFiltrosMarcas}
                
                filtroModelo={filtroModelo}
                setFiltroModelo={setFiltroModelo}
                
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
                    fetchProdutos();
                }}
            />
        </div>
    );
}

export default Produtos;