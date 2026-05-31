import './styles.css';
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableContainer } from '../../components/specific/TableContainer';
import Button from '../../components/common/Button';
import { IconButton } from '../../components/common/IconButton';
import { SearchBar } from '../../components/common/SearchBar';
import { DataTable } from '../../components/common/DataTable';
import { VendaService } from '../../services/VendaService';
import DetalhesVendaModal from '../../components/common/DetalhesVendaModal';
import EditarVendaModal from '../../components/common/EditarVendaModal';
import FilterVendaModal from '../../components/common/FilterVendaModal';

function Vendas() {
    const navigate = useNavigate();
    const [vendas, setVendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState("");

    // Estados para os Filtros
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [vendedores, setVendedores] = useState([]);
    const [formasPagamento, setFormasPagamento] = useState([]);
    const [filtroDataInicio, setFiltroDataInicio] = useState("");
    const [filtroDataFim, setFiltroDataFim] = useState("");
    const [filtrosVendedores, setFiltrosVendedores] = useState([]);
    const [filtrosFormasPagamento, setFiltrosFormasPagamento] = useState([]);
    const [valorMin, setValorMin] = useState("");
    const [valorMax, setValorMax] = useState("");

    // Estados para Controle dos Modais
    const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [vendaSelecionada, setVendaSelecionada] = useState(null);

    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalElementos, setTotalElementos] = useState(0);
    const [verTodos, setVerTodos] = useState(false);
    const [tamanhoPagina, setTamanhoPagina] = useState(15);

    const limparFiltros = () => {
        setFiltroDataInicio("");
        setFiltroDataFim("");
        setFiltrosVendedores([]);
        setFiltrosFormasPagamento([]);
        setValorMin("");
        setValorMax("");
        setTermoBusca("");
        setIsFilterOpen(false);
    };

    const colunas = [
        { header: "Vendedor", accessor: "nomeVendedor" },
        { header: "Valor (R$)", accessor: "valorTotalExibicao" },
        { header: "Data/Hora", accessor: "dataExibicao" },
        { header: "Pagamento", accessor: "formaPagamento" },
    ];

    const carregarDadosApoio = async () => {
        try {
            const pagRes = await VendaService.getFormasPagamento();
            setFormasPagamento(Array.isArray(pagRes) ? pagRes : (pagRes?.data || []));
        } catch (err) {
            console.error("Erro ao carregar dados de apoio:", err);
        }
    };

    const fetchVendas = async (pagina = 0, isAll = verTodos, tamanhoAtual = tamanhoPagina) => {
        try {
            setLoading(true);
            let listaVendas = [];

            if (isAll) {
                const dados = await VendaService.getAll();
                listaVendas = Array.isArray(dados) ? dados : (dados?.data || []);
                setPaginaAtual(0);
                setTotalPaginas(1);
                setTotalElementos(listaVendas.length);
            } else {
                const dados = await VendaService.getPaginated(pagina, tamanhoAtual);
                
                // 👀 Log para descobrirmos o que o backend realmente mandou
                console.log("Retorno da API Paginada:", dados); 

                // Tenta buscar o array em diversas nomenclaturas comuns do Spring e do seu projeto
                listaVendas = dados?.conteudo || dados?.vendas || dados?.itens || dados?.content || [];
                
                // Mapeia as propriedades da paginação com rotas de fallback
                setPaginaAtual(dados?.pagina ?? dados?.number ?? pagina);
                setTotalPaginas(dados?.totalPaginas ?? dados?.totalPages ?? 1);
                setTotalElementos(dados?.total ?? dados?.totalElements ?? 0);
            }

            if (listaVendas.length > 0) {
                const vendasComNomes = listaVendas.map((venda) => ({
                    ...venda,
                    nomeVendedor: venda.funcionarioNome || "Desconhecido",
                    valorTotalExibicao: venda.valorTotalDaVenda
                        ? `R$ ${venda.valorTotalDaVenda.toFixed(2).replace('.', ',')}`
                        : "R$ 0,00",
                    dataExibicao: new Date(venda.dataHora).toLocaleString('pt-BR')
                }));
                setVendas(vendasComNomes);
            } else {
                setVendas([]);
            }
        } catch (err) {
            console.error("Erro no processamento das vendas:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDadosApoio();
        fetchVendas(0);
    }, []);

    const irParaPagina = (pagina) => {
        if (pagina >= 0 && pagina < totalPaginas && pagina !== paginaAtual) {
            fetchVendas(pagina, verTodos, tamanhoPagina);
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

    const handleToggleVerTodos = () => {
        const novoStatus = !verTodos;
        setVerTodos(novoStatus);
        fetchVendas(0, novoStatus, tamanhoPagina);
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
        fetchVendas(0, verTodos, novoTamanho);
    };


    const dadosFiltrados = vendas.filter(v => {
        if (filtrosVendedores.length > 0 && !filtrosVendedores.includes(v.idVendedor)) return false;
        if (filtrosFormasPagamento.length > 0 && !filtrosFormasPagamento.includes(v.formaPagamento)) return false;

        const total = Number(v.valorTotalDaVenda) || 0;
        if (valorMin && total < Number(valorMin)) return false;
        if (valorMax && total > Number(valorMax)) return false;

        if (v.dataHora) {
            const dataVenda = String(v.dataHora).slice(0, 10);
            if (filtroDataInicio && dataVenda < filtroDataInicio) return false;
            if (filtroDataFim && dataVenda > filtroDataFim) return false;
        }

        if (!termoBusca.trim()) return true;
        const termo = termoBusca.toLowerCase();
        return (v.nomeVendedor || "").toLowerCase().includes(termo) ||
            (v.formaPagamento || "").toLowerCase().includes(termo) ||
            (v.dataExibicao || "").toLowerCase().includes(termo);
    });

    const handleDeleteVenda = async (venda) => {
        if (!window.confirm(`Deseja realmente excluir a venda #${venda.id}?`)) return;
        try {
            await VendaService.delete(venda.id);
            fetchVendas(paginaAtual);
        } catch (err) {
            alert("Erro ao excluir venda.");
        }
    };


    return (
        <div className="page-container">
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
                            <Button onClick={() => navigate('/painel-vendas')}>Nova Venda</Button>
                        </div>
                        <div style={{ flexGrow: 1, minWidth: '200px' }}>
                            <SearchBar
                                placeholder="Pesquisar em qualquer coluna..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, color: '#4A4A4A', fontWeight: '500' }}>
                            <input 
                                type="checkbox" 
                                id="toggleVerTodosVendas" 
                                checked={verTodos}
                                onChange={handleToggleVerTodos}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="toggleVerTodosVendas" style={{ cursor: 'pointer', userSelect: 'none' }}>
                                Ver todas
                            </label>
                        </div>
                        <div style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                            <Button onClick={() => setIsFilterOpen(true)}>Filtrar</Button>
                        </div>
                    </div>
                }
            >
                {loading ? (
                    <div className="empty-table-placeholder">Carregando histórico...</div>
                ) : (
                    <>
                        <DataTable
                            columns={colunas}
                            data={dadosFiltrados}
                            actions={(venda) => (
                                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                                    <IconButton icon={FiEye} onClick={() => { setVendaSelecionada(venda); setModalDetalhesAberto(true); }} />
                                    <IconButton icon={FiEdit} onClick={() => { setVendaSelecionada(venda); setModalEditarAberto(true); }} />
                                    <IconButton icon={FiTrash} onClick={() => handleDeleteVenda(venda)} />
                                </div>
                            )}
                        />

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

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#5D78A9' }}>
                                        <label htmlFor="itensPorPaginaVendas">Itens por página:</label>
                                        <input 
                                            type="number"
                                            id="itensPorPaginaVendas"
                                            min="1"
                                            value={tamanhoPagina} 
                                            onChange={(e) => setTamanhoPagina(e.target.value)}
                                            onBlur={handleAplicarTamanho}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAplicarTamanho()}
                                            style={{ 
                                                width: '60px', padding: '4px 8px', borderRadius: '6px', 
                                                border: '1px solid #C5D3F7', outline: 'none', 
                                                color: '#2D3E50', textAlign: 'center'
                                            }}
                                        />
                                    </div>

                                    <span className="btn-paginacao-info">
                                        {totalElementos} venda{totalElementos !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </TableContainer>

            <DetalhesVendaModal
                show={modalDetalhesAberto}
                onClose={() => setModalDetalhesAberto(false)}
                venda={vendaSelecionada}
            />
            <EditarVendaModal
                show={modalEditarAberto}
                onClose={() => setModalEditarAberto(false)}
                venda={vendaSelecionada}
                onUpdateSuccess={() => fetchVendas(paginaAtual)}
            />
            <FilterVendaModal
                show={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onClear={limparFiltros}
                vendedores={vendedores}
                formasPagamento={formasPagamento}
                filtroDataInicio={filtroDataInicio} setFiltroDataInicio={setFiltroDataInicio}
                filtroDataFim={filtroDataFim} setFiltroDataFim={setFiltroDataFim}
                filtrosVendedores={filtrosVendedores} setFiltrosVendedores={setFiltrosVendedores}
                filtrosFormasPagamento={filtrosFormasPagamento} setFiltrosFormasPagamento={setFiltrosFormasPagamento}
                valorMin={valorMin} setValorMin={setValorMin}
                valorMax={valorMax} setValorMax={setValorMax}
                aplicarFiltros={(e) => { e.preventDefault(); setIsFilterOpen(false); }}
            />
        </div>
    );
}

export default Vendas;