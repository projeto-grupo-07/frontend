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
import { FuncionarioService } from '../../services/FuncionarioService';
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

    const limparFiltros = () => {
        setFiltroDataInicio("");
        setFiltroDataFim("");
        setFiltrosVendedores([]);
        setFiltrosFormasPagamento([]);
        setValorMin("");
        setValorMax("");
        setTermoBusca(""); // Opcional: limpa a barra de pesquisa também
        setIsFilterOpen(false); // Fecha o modal
    };

    const colunas = [
        { header: "Vendedor", accessor: "nomeVendedor" },
        { header: "Valor (R$)", accessor: "valorTotalExibicao" },
        { header: "Data/Hora", accessor: "dataExibicao" },
        { header: "Pagamento", accessor: "formaPagamento" },
    ];

    const carregarDadosApoio = async () => {
        try {
            const funcRes = await FuncionarioService.getAll();
            setVendedores(Array.isArray(funcRes) ? funcRes : (funcRes?.data || []));

            const pagRes = await VendaService.getFormasPagamento();
            setFormasPagamento(Array.isArray(pagRes) ? pagRes : (pagRes?.data || []));
        } catch (err) {
            console.error("Erro ao carregar dados de apoio para os filtros:", err);
        }
    };

    const fetchVendas = async () => {
        try {
            setLoading(true);
            const res = await VendaService.getAll();
            const listaVendas = Array.isArray(res) ? res : [];

            if (listaVendas.length > 0) {
                const vendasComNomes = await Promise.all(
                    listaVendas.map(async (venda) => {
                        let nomeVend = "Carregando...";
                        try {
                            const func = await FuncionarioService.getById(venda.idVendedor);
                            nomeVend = func?.nome || "Desconhecido";
                        } catch (e) {
                            nomeVend = "Erro ao buscar";
                        }

                        return {
                            ...venda,
                            nomeVendedor: nomeVend,
                            valorTotalExibicao: venda.valorTotalDaVenda
                                ? `R$ ${venda.valorTotalDaVenda.toFixed(2).replace('.', ',')}`
                                : "R$ 0,00",
                            dataExibicao: new Date(venda.dataHora).toLocaleString('pt-BR')
                        };
                    })
                );
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
        fetchVendas();
    }, []);

    // Lógica principal de filtragem
    const dadosFiltrados = vendas.filter(v => {
        // 1. Filtro de Vendedor
        if (filtrosVendedores.length > 0 && !filtrosVendedores.includes(v.idVendedor)) {
            return false;
        }

        // 2. Filtro de Forma de Pagamento (Multi-select: mesma lógica de inclusão)
        if (filtrosFormasPagamento.length > 0 && !filtrosFormasPagamento.includes(v.formaPagamento)) {
            return false;
        }

        // 3. Filtro de Valor Mínimo/Máximo
        const total = Number(v.valorTotalDaVenda) || 0;
        if (valorMin && total < Number(valorMin)) return false;
        if (valorMax && total > Number(valorMax)) return false;

        // 4. Filtro de Data
        // A data vem do back como "2026-03-14T10:30:00", o slice(0,10) pega só o "2026-03-14"
        if (v.dataHora) {
            const dataVenda = String(v.dataHora).slice(0, 10);
            if (filtroDataInicio && dataVenda < filtroDataInicio) return false;
            if (filtroDataFim && dataVenda > filtroDataFim) return false;
        }

        // 5. Filtro de Texto (Barra de busca)
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
            fetchVendas();
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
                        flexDirection: 'row', // Força direção horizontal
                        flexWrap: 'nowrap',   // PROÍBE quebra de linha
                        alignItems: 'center',
                        justifyContent: 'space-between', // Espalha os botões nas pontas e a busca no meio
                        gap: '15px',
                        width: '100%',
                        minWidth: '600px', // O HACK SALVADOR: Garante espaço mínimo para os 3 elementos não se esmagarem
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
                    <DataTable
                        columns={colunas}
                        data={dadosFiltrados}
                        actions={(venda) => (
                            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                                <IconButton
                                    icon={FiEye}
                                    onClick={() => {
                                        setVendaSelecionada(venda);
                                        setModalDetalhesAberto(true);
                                    }}
                                />

                                <IconButton
                                    icon={FiEdit}
                                    onClick={() => {
                                        setVendaSelecionada(venda);
                                        setModalEditarAberto(true);
                                    }}
                                />

                                <IconButton
                                    icon={FiTrash}
                                    onClick={() => handleDeleteVenda(venda)}
                                />
                            </div>
                        )}
                    />
                )}
            </TableContainer>

            {/* Modais de Suporte */}
            <DetalhesVendaModal
                show={modalDetalhesAberto}
                onClose={() => setModalDetalhesAberto(false)}
                venda={vendaSelecionada}
            />

            <EditarVendaModal
                show={modalEditarAberto}
                onClose={() => setModalEditarAberto(false)}
                venda={vendaSelecionada}
                onUpdateSuccess={fetchVendas}
            />

            {/* Novo Modal de Filtro */}
            <FilterVendaModal
                show={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onClear={limparFiltros}
                vendedores={vendedores}
                formasPagamento={formasPagamento}
                filtroDataInicio={filtroDataInicio} setFiltroDataInicio={setFiltroDataInicio}
                filtroDataFim={filtroDataFim} setFiltroDataFim={setFiltroDataFim}

                // --- AQUI ESTÃO AS NOVAS VARIÁVEIS NO PLURAL ---
                filtrosVendedores={filtrosVendedores} setFiltrosVendedores={setFiltrosVendedores}
                filtrosFormasPagamento={filtrosFormasPagamento} setFiltrosFormasPagamento={setFiltrosFormasPagamento}
                // ------------------------------------------------

                valorMin={valorMin} setValorMin={setValorMin}
                valorMax={valorMax} setValorMax={setValorMax}
                aplicarFiltros={(e) => { e.preventDefault(); setIsFilterOpen(false); }}
            />
        </div>
    );
}

export default Vendas;