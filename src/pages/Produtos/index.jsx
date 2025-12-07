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

function Produtos() {
    const [produtos, setProdutos] = useState([]);
    const [colunas, setColunas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [filtroCategoria, setFiltroCategoria] = useState(""); // vazio = Todas
    const [filtroSubcategoria, setFiltroSubcategoria] = useState("");
    const [filtroMarca, setFiltroMarca] = useState("");
    const [filtroModelo, setFiltroModelo] = useState("");
    const [filtroNome, setFiltroNome] = useState("");
    const [precoMin, setPrecoMin] = useState("");
    const [precoMax, setPrecoMax] = useState("");

    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);

    // ---------------- FETCH DE PRODUTOS ----------------
    const fetchProdutos = async () => {
        try {
            setLoading(true);
            const produtosRaw = await ProductService.getAll();
            console.log("Fetch produtosRaw:", produtosRaw);
            const safeProdutos = Array.isArray(produtosRaw) ? produtosRaw : [];
            setProdutos(safeProdutos);
            console.log("State produtos atualizado:", safeProdutos);
        } catch (err) {
            console.error("Erro ao buscar produtos:", err);
        } finally {
            setLoading(false);
        }
    };

    // ---------------- FETCH CATEGORIAS ----------------
    useEffect(() => {
        const loadCategorias = async () => {
            try {
                const list = await CategoriesService.getParentCategories();
                const safeList = Array.isArray(list) ? list : [];
                setCategorias(safeList);
                console.log("Categorias carregadas:", safeList);
            } catch (err) {
                console.error("Erro ao buscar categorias:", err);
            }
        };
        loadCategorias();
    }, []);

    useEffect(() => {
        fetchProdutos();
    }, []);

    // ---------------- CONFIGURAÇÃO DE COLUNAS ----------------
    const atualizarColunas = () => {
        console.log("Atualizando colunas para filtroCategoria:", filtroCategoria);
        if (filtroCategoria.toLowerCase() === "calçados") {
            setColunas([
                { header: "Marca", accessor: "marca" },
                { header: "Modelo", accessor: "modelo" },
                { header: "Número", accessor: "numero" },
                { header: "Cor", accessor: "cor" },
                { header: "Preço", accessor: "valorUnitario" },
                { header: "Categoria", accessor: "categoriaPai" },
            ]);
        } else if (filtroCategoria.toLowerCase() === "outros") {
            setColunas([
                { header: "Nome", accessor: "nome" },
                { header: "Descrição", accessor: "descricao" },
                { header: "Preço", accessor: "valorUnitario" },
                { header: "Categoria", accessor: "categoriaPai" },
            ]);
        } else { // Todas
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
    }, [filtroCategoria]);

    // ---------------- FILTRO DOS DADOS ----------------
    const dadosFiltrados = produtos
        .filter(p => {
            console.log("Filtro categoria atual:", filtroCategoria, "Produto tipo:", p.tipo);
            if (!filtroCategoria || filtroCategoria.toLowerCase() === "todas") return true;
            if (filtroCategoria.toLowerCase() === "calçados" && p.tipo !== "calcado") return false;
            if (filtroCategoria.toLowerCase() === "outros" && p.tipo !== "outros") return false;
            return true;
        })
        .map(p => {
            if (!filtroCategoria || filtroCategoria.toLowerCase() === "todas") {
                return {
                    ...p,
                    nomeMarca: p.marca || p.nome,
                    modeloDescricao: p.modelo || p.descricao,
                };
            }
            return p;
        });

    console.log("Produtos brutos:", produtos);
    console.log("Dados filtrados para DataTable:", dadosFiltrados);

    // ---------------- AÇÕES ----------------
    function handleEdit(produto) {
        console.log("Editar produto:", produto);
    }

    const aplicarFiltros = (e) => {
        e.preventDefault();
        setIsFilterOpen(false);
        console.log("Filtros aplicados:", {
            filtroCategoria,
            filtroSubcategoria,
            filtroMarca,
            filtroModelo,
            filtroNome,
            precoMin,
            precoMax
        });
    };

    async function handleDelete(produto) {
        if (!window.confirm("Você tem certeza que quer deletar esse produto?")) return;
        try {
            setLoading(true);
            await ProductService.delete(produto);
            fetchProdutos();
        } catch (err) {
            alert(err.response?.data?.message || "Não foi possível deletar o produto.");
        } finally {
            setLoading(false);
        }
    }

    // ---------------- RENDER ----------------
    return (
        <div className="page-container">
            <h1 className="page-title">Produtos</h1>
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
                                    <IconButton icon={FiEdit} onClick={() => handleEdit(produto)} />
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

            <FilterModal
                show={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                categorias={categorias}
                subcategorias={subcategorias}
                filtroCategoria={filtroCategoria}
                setFiltroCategoria={setFiltroCategoria}
                filtroSubcategoria={filtroSubcategoria}
                setFiltroSubcategoria={setFiltroSubcategoria}
                filtroMarca={filtroMarca}
                setFiltroMarca={setFiltroMarca}
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
        </div>
    );
}

export default Produtos;
