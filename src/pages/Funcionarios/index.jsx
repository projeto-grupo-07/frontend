import { useState, useEffect } from 'react';
import { FiEdit, FiTrash } from "react-icons/fi";
import { TableContainer } from '../../components/specific/TableContainer';
import { SearchBar } from '../../components/common/SearchBar';
import { DataTable } from '../../components/common/DataTable';
import { IconButton } from '../../components/common/IconButton';
import { FuncionarioService } from '../../services/FuncionarioService';
import EditarFuncionarioModal from "../../components/common/EditarFuncionarioModal";
import CadastrarFuncionarioModal from "../../components/common/CadastrarFuncionarioModal";
import './styles.css';

function Funcionarios() {
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState("");
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
    const [modalCadastroAberto, setModalCadastroAberto] = useState(false);

    // ESTADOS DE PAGINAÇÃO E FILTRO GLOBAL
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalElementos, setTotalElementos] = useState(0);
    const [verTodos, setVerTodos] = useState(false);
    const [tamanhoPagina, setTamanhoPagina] = useState(15);

    const colunas = [
        { header: "Nome", accessor: "nome" },
        { header: "Email", accessor: "email" },
        { header: "Cargo", accessor: "cargo" },
        { header: "Comissão", accessor: "comissaoFormatada" },
    ];

    const formatarCargo = (perfil) => {
        if (!perfil || !perfil.nome) return "Não Atribuído";
        const nomeRaw = perfil.nome.toLowerCase();
        return nomeRaw.charAt(0).toUpperCase() + nomeRaw.slice(1);
    };

    const loadFuncionarios = async (pagina = 0, isAll = verTodos, tamanhoAtual = tamanhoPagina) => {
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

            const formatados = lista
                .filter(f => f.ativo !== false) 
                .map(f => ({
                    ...f,
                    cargo: formatarCargo(f.perfil),
                    comissaoFormatada: f.comissao
                        ? `${(f.comissao * 100).toFixed(0)}%`
                        : "0%"
                }));

            setFuncionarios(formatados);
        } catch (err) {
            console.error("Erro ao carregar funcionários:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFuncionarios(0);
    }, []);

    useEffect(() => {
        document.title = "Funcionários | Brink Calçados";
    }, []);

    const irParaPagina = (pagina) => {
        if (pagina >= 0 && pagina < totalPaginas && pagina !== paginaAtual) {
            loadFuncionarios(pagina, verTodos, tamanhoPagina);
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
        loadFuncionarios(0, novoStatus, tamanhoPagina);
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
        loadFuncionarios(0, verTodos, novoTamanho);
    };

    const handleDelete = async (id) => {
        const confirmacao = window.confirm("Deseja realmente remover este funcionário? (Ele será desativado do sistema)");
        if (!confirmacao) return;

        try {
            await FuncionarioService.delete(id);
            alert("Funcionário desativado com sucesso!");
            loadFuncionarios(paginaAtual); 
        } catch (err) {
            alert("Erro ao desativar funcionário. Verifique a conexão.");
        }
    };

    const dadosFiltrados = funcionarios.filter(f =>
        (f.nome || "").toLowerCase().includes(termoBusca.toLowerCase()) ||
        (f.email || "").toLowerCase().includes(termoBusca.toLowerCase())
    );

    return (
        <div className="page-container">
            <TableContainer
                header={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', width: '100%', paddingBottom: '8px' }}>
                        
                        <button 
                            onClick={() => setModalCadastroAberto(true)}
                            style={{ 
                                padding: '10px 24px', 
                                backgroundColor: '#ed64a6', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontWeight: 'bold', 
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                width: 'fit-content',
                                fontSize: '15px'
                            }}
                        >
                            + Adicionar Funcionário
                        </button>

                        <div style={{ flex: 1 }}>
                            <SearchBar
                                placeholder="Pesquisar por nome ou email..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                            />
                        </div>

                        {/* NOVO: Checkbox de Filtro Global */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, color: '#4A4A4A', fontWeight: '500' }}>
                            <input 
                                type="checkbox" 
                                id="toggleVerTodosFuncionarios" 
                                checked={verTodos}
                                onChange={handleToggleVerTodos}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="toggleVerTodosFuncionarios" style={{ cursor: 'pointer', userSelect: 'none' }}>
                                Ver todos
                            </label>
                        </div>

                    </div>
                }
            >
                {loading ? (
                    <div className="empty-table-placeholder">Buscando dados da equipe...</div>
                ) : (
                    <>
                        <DataTable
                            columns={colunas}
                            data={dadosFiltrados}
                            actions={(func) => (
                                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                                    <IconButton
                                        icon={FiEdit}
                                        onClick={() => {
                                            setFuncionarioSelecionado(func);
                                            setModalEditarAberto(true);
                                        }}
                                    />
                                    <IconButton 
                                        icon={FiTrash} 
                                        onClick={() => handleDelete(func.id)} 
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
                                        <label htmlFor="itensPorPaginaFuncionarios">Itens por página:</label>
                                        <input 
                                            type="number"
                                            id="itensPorPaginaFuncionarios"
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

            <EditarFuncionarioModal
                show={modalEditarAberto}
                onClose={() => setModalEditarAberto(false)}
                funcionario={funcionarioSelecionado}
                onUpdateSuccess={() => loadFuncionarios(paginaAtual)}
            />

            <CadastrarFuncionarioModal 
                show={modalCadastroAberto}
                onClose={() => setModalCadastroAberto(false)}
                onSuccess={() => loadFuncionarios(paginaAtual)}
            />
        </div>
    );
}

export default Funcionarios;