import { useState, useEffect } from 'react';
import { FiEdit, FiTrash, FiSearch, FiDollarSign } from "react-icons/fi";
import { TableContainer } from '../../components/specific/TableContainer';
import { DataTable } from '../../components/common/DataTable';
import { IconButton } from '../../components/common/IconButton';
import { FuncionarioService } from '../../services/FuncionarioService';
import { KpiService } from '../../services/KpiService';
import EditarComissaoModal from "../../components/common/EditarComissaoModal";
import AcertoContaModal from "../../components/common/AcertoContaModal";
import './styles.css';

function Comissao() {
    const [dadosTabela, setDadosTabela] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState("");
    const [modalAberto, setModalAberto] = useState(false);
    const [funcionarioParaEditar, setFuncionarioParaEditar] = useState(null);
    const [funcionarioAcerto, setFuncionarioAcerto] = useState(null);

    // ESTADOS DE PAGINAÇÃO
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalElementos, setTotalElementos] = useState(0);
    const [verTodos, setVerTodos] = useState(false);
    const [tamanhoPagina, setTamanhoPagina] = useState(15);

    const colunas = [
        { header: "Nome Funcionário", accessor: "nome" },
        { header: "Taxa (%)", accessor: "taxaComissaoFormatada" },
        { header: "Qtd Vendas", accessor: "qtdVendas" },
        { header: "Faturamento", accessor: "faturamentoFormatado" },
        { header: "Comissão", accessor: "comissaoFormatada" },
    ];

    const carregarDadosComissao = async (pagina = 0, isAll = verTodos, tamanhoAtual = tamanhoPagina) => {
        try {
            setLoading(true);
            let lista = [];

            if (isAll) {
                const res = await FuncionarioService.getAll();
                lista = Array.isArray(res) ? res : (res?.data || []);
                setPaginaAtual(0);
                setTotalPaginas(1);
                setTotalElementos(lista.length);
            } else {
                const res = await FuncionarioService.getPaginated(pagina, tamanhoAtual);
                lista = res?.conteudo || res?.content || [];
                setPaginaAtual(res?.pagina ?? res?.number ?? pagina);
                setTotalPaginas(res?.totalPaginas ?? res?.totalPages ?? 1);
                setTotalElementos(res?.totalElementos ?? res?.totalElements ?? res?.total ?? 0);
            }

            const ativos = lista.filter(f => f.ativo !== false);

            const listaComMetricas = await Promise.all(ativos.map(async (func) => {
                const [faturamento, comissao, qtdVendas] = await Promise.all([
                    KpiService.getFaturamentoPorVendedor(func.id),
                    KpiService.getComissaoPorVendedor(func.id),
                    KpiService.getQuantidadeVendasPorVendedor(func.id)
                ]);

                return {
                    ...func,
                    taxaComissaoFormatada: func.comissao != null ? `${(func.comissao * 100).toFixed(0)}%` : "0%",
                    qtdVendas: qtdVendas || 0,
                    faturamentoFormatado: faturamento ? `R$ ${faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "R$ 0,00",
                    comissaoFormatada: comissao ? `R$ ${comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "R$ 0,00"
                };
            }));

            setDadosTabela(listaComMetricas);
        } catch (error) {
            console.error("Erro ao carregar dados de comissão:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDadosComissao(0);
    }, []);

    // FUNÇÕES DE CONTROLE DE PAGINAÇÃO
    const irParaPagina = (pagina) => {
        if (pagina >= 0 && pagina < totalPaginas && pagina !== paginaAtual) {
            carregarDadosComissao(pagina, verTodos, tamanhoPagina);
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
        carregarDadosComissao(0, novoStatus, tamanhoPagina);
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
        carregarDadosComissao(0, verTodos, novoTamanho);
    };

    const dadosFiltrados = dadosTabela.filter(f =>
        f.nome.toLowerCase().includes(termoBusca.toLowerCase())
    );

    return (
        <div className="comissao-page">
            <TableContainer
                header={
                    <div className="comissao-header-content" style={{ width: '100%', boxSizing: 'border-box', display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            padding: '10px 16px',
                            flex: 1, // Faz a barra de pesquisa crescer
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                            border: '1px solid #cbd5e0',
                            boxSizing: 'border-box'
                        }}>
                            <FiSearch color="#a0aec0" size={18} style={{ marginRight: '10px', flexShrink: 0 }} />
                            <input
                                type="text"
                                placeholder="Pesquisar por nome do funcionário..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    width: '100%',
                                    fontSize: '15px',
                                    color: '#2d3748',
                                    backgroundColor: 'transparent'
                                }}
                            />
                        </div>

                        {/* NOVO: Checkbox de Filtro Global */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, color: '#4A4A4A', fontWeight: '500' }}>
                            <input 
                                type="checkbox" 
                                id="toggleVerTodosComissao" 
                                checked={verTodos}
                                onChange={handleToggleVerTodos}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="toggleVerTodosComissao" style={{ cursor: 'pointer', userSelect: 'none' }}>
                                Ver todos
                            </label>
                        </div>
                    </div>
                }
            >
                {loading ? (
                    <div className="loading-state">Carregando dados de comissão...</div>
                ) : (
                    <>
                        <DataTable
                            columns={colunas}
                            data={dadosFiltrados}
                            actions={(item) => (
                                <div className="action-buttons">
                                    <IconButton
                                        icon={FiDollarSign}
                                        title="Acerto de Contas"
                                        onClick={() => setFuncionarioAcerto(item)}
                                    />
                                    <IconButton
                                        icon={FiEdit}
                                        title="Editar Taxa"
                                        onClick={() => {
                                            setFuncionarioParaEditar(item);
                                            setModalAberto(true);
                                        }}
                                    />
                                </div>
                            )}
                        />

                        {/* NOVO: Wrapper da Paginação Offset */}
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
                                        <label htmlFor="itensPorPaginaComissao">Itens por página:</label>
                                        <input 
                                            type="number"
                                            id="itensPorPaginaComissao"
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
                                        {totalElementos} funcionário{totalElementos !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </TableContainer>

            <EditarComissaoModal
                show={modalAberto}
                onClose={() => setModalAberto(false)}
                funcionario={funcionarioParaEditar}
                onUpdateSuccess={() => carregarDadosComissao(paginaAtual)}
            />

            <AcertoContaModal
                show={Boolean(funcionarioAcerto)}
                onClose={() => setFuncionarioAcerto(null)}
                funcionario={funcionarioAcerto}
            />
        </div>
    );
}

export default Comissao;