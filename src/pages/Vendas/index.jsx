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

    const TAMANHO_PAGINA = 15;

    // PAGINAÇÃO CURSOR
    const [pilhaAnterior, setPilhaAnterior] = useState([]);
    const [proximoCursor, setProximoCursor] = useState(null);
    const [cursorAtual, setCursorAtual] = useState(null);

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

    const fetchVendas = async (cursor = null) => {
        try {
            setLoading(true);
            const dados = await VendaService.getCursor(cursor, TAMANHO_PAGINA);
            const listaVendas = dados.conteudo || [];

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

            setProximoCursor(dados.proximoCursor ?? null);
        } catch (err) {
            console.error("Erro no processamento das vendas:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDadosApoio();
        fetchVendas(null);
    }, []);

    const irParaProxima = () => {
        if (!proximoCursor) return;
        setPilhaAnterior(prev => [...prev, cursorAtual]);
        setCursorAtual(proximoCursor);
        fetchVendas(proximoCursor);
    };

    const irParaAnterior = () => {
        if (pilhaAnterior.length === 0) return;
        const pilha = [...pilhaAnterior];
        const cursorVoltar = pilha.pop();
        setPilhaAnterior(pilha);
        setCursorAtual(cursorVoltar);
        fetchVendas(cursorVoltar);
    };

    const voltarParaPrimeira = () => {
        setPilhaAnterior([]);
        setCursorAtual(null);
        fetchVendas(null);
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
            voltarParaPrimeira();
        } catch (err) {
            alert("Erro ao excluir venda.");
        }
    };

    const primeiraPagina = pilhaAnterior.length === 0;
    const ultimaPagina = proximoCursor === null;

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

                        <div className="pagination-wrapper">
                            <button
                                className="btn-paginacao"
                                disabled={primeiraPagina}
                                onClick={voltarParaPrimeira}
                            >
                                « Primeira
                            </button>
                            <button
                                className="btn-paginacao"
                                disabled={primeiraPagina}
                                onClick={irParaAnterior}
                            >
                                Anterior
                            </button>
                            <button
                                className="btn-paginacao"
                                disabled={ultimaPagina}
                                onClick={irParaProxima}
                            >
                                Próxima
                            </button>
                        </div>
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
                onUpdateSuccess={voltarParaPrimeira}
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