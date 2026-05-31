import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { TableContainer } from '../../components/specific/TableContainer';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { IconButton } from '../../components/common/IconButton';
import Button from '../../components/common/Button'; 
import { ClienteService } from '../../services/ClienteService';
import CadastrarClienteModal from '../../components/common/CadastrarClienteModal';
import FilterClienteModal from '../../components/common/FilterClienteModal'; // NOVO MODAL
import './styles.css';

export default function ClientePage() {
    const [clientes, setClientes] = useState([]);
    const [filtros, setFiltros] = useState({ nome: '', genero: '' });
    const [isLoading, setIsLoading] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // ESTADO DO MODAL DE FILTRO
    const [clienteEmEdicao, setClienteEmEdicao] = useState(null);

    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalElementos, setTotalElementos] = useState(0);
    const [verTodos, setVerTodos] = useState(false);
    const [tamanhoPagina, setTamanhoPagina] = useState(15);

    const colunas = [
        { header: "ID", accessor: "id" },
        { header: "Nome", accessor: "nome" },
        { header: "E-mail", accessor: "email" },
        { header: "Telefone", accessor: "telefoneFormatado" },
        { header: "Gênero", accessor: "generoFormatado" },
    ];

    const carregarClientes = async (pagina = 0, isAll = verTodos, tamanhoAtual = tamanhoPagina) => {
        setIsLoading(true);
        try {
            let lista = [];

            if (isAll) {
                const response = await ClienteService.listar();
                if (response.status !== 204) {
                    lista = response.data || response || [];
                }
                setPaginaAtual(0);
                setTotalPaginas(1);
                setTotalElementos(lista.length);
            } else {
                const response = await ClienteService.getPaginated(pagina, tamanhoAtual);
                const dados = response.data || response;
                lista = dados?.conteudo || dados?.content || [];
                
                setPaginaAtual(dados?.pagina ?? dados?.number ?? pagina);
                setTotalPaginas(dados?.totalPaginas ?? dados?.totalPages ?? 1);
                setTotalElementos(dados?.totalElementos ?? dados?.totalElements ?? dados?.total ?? 0);
            }

            const listaFormatada = lista.map(c => ({
                ...c,
                telefoneFormatado: c.telefone || '-',
                generoFormatado: c.genero || '-'
            }));

            setClientes(listaFormatada);
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
            setClientes([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        carregarClientes(0);
    }, []);

    const irParaPagina = (pagina) => {
        if (pagina >= 0 && pagina < totalPaginas && pagina !== paginaAtual) {
            carregarClientes(pagina, verTodos, tamanhoPagina);
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
        
        if (novoStatus) setFiltros({ nome: '', genero: '' });
        carregarClientes(0, novoStatus, tamanhoPagina);
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
        carregarClientes(0, verTodos, novoTamanho);
    };

    const aplicarFiltros = async () => {
        setIsLoading(true);
        setVerTodos(false);
        try {
            const response = await ClienteService.filtrar(filtros);
            if (response.status === 204) {
                setClientes([]);
                setTotalElementos(0);
                setTotalPaginas(1);
            } else {
                const lista = response.data || response || [];
                const listaFormatada = lista.map(c => ({
                    ...c,
                    telefoneFormatado: c.telefone || '-',
                    generoFormatado: c.genero || '-'
                }));
                setClientes(listaFormatada);
                setTotalElementos(listaFormatada.length);
                setTotalPaginas(1); 
            }
        } catch (error) {
            console.error(error);
            setClientes([]);
        } finally {
            setIsLoading(false);
        }
    };

    const limparFiltros = () => {
        setFiltros({ nome: '', genero: '' });
        carregarClientes(0, verTodos, tamanhoPagina);
    };

    const handleDeletar = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            try {
                await ClienteService.deletar(id);
                carregarClientes(paginaAtual); 
            } catch (error) {
                alert('Erro ao excluir cliente.');
            }
        }
    };

    const handleAbrirModalCadastro = () => {
        setClienteEmEdicao(null);
        setIsModalOpen(true);
    };

    const handleAbrirModalEdicao = (cliente) => {
        setClienteEmEdicao(cliente);
        setIsModalOpen(true);
    };

    const handleSalvarCliente = async (dadosFormulario) => {
        try {
            if (clienteEmEdicao) {
                await ClienteService.atualizar(clienteEmEdicao.id, dadosFormulario);
                alert("Cliente atualizado com sucesso!");
            } else {
                await ClienteService.cadastrar(dadosFormulario);
                alert("Cliente cadastrado com sucesso!");
            }
            setIsModalOpen(false);
            carregarClientes(paginaAtual);
        } catch (error) {
            alert("Erro ao salvar cliente.");
            console.error(error);
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
                            <Button onClick={handleAbrirModalCadastro}>+ Adicionar Cliente</Button>
                        </div>

                        {/* Search bar para busca rápida pelo nome */}
                        <div style={{ flexGrow: 1, minWidth: '200px' }}>
                            <SearchBar
                                placeholder="Pesquisar por nome..."
                                value={filtros.nome}
                                onChange={(e) => setFiltros(prev => ({ ...prev, nome: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, color: '#4A4A4A', fontWeight: '500' }}>
                            <input 
                                type="checkbox" 
                                id="toggleVerTodosClientes" 
                                checked={verTodos}
                                onChange={handleToggleVerTodos}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="toggleVerTodosClientes" style={{ cursor: 'pointer', userSelect: 'none' }}>
                                Ver todos
                            </label>
                        </div>

                        <div style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                            <Button onClick={() => setIsFilterModalOpen(true)}>Filtrar</Button>
                        </div>

                    </div>
                }
            >
                {isLoading ? (
                    <div className="empty-table-placeholder">Buscando base de clientes...</div>
                ) : (
                    <>
                        {clientes.length > 0 ? (
                            <DataTable
                                columns={colunas}
                                data={clientes}
                                actions={(cliente) => (
                                    <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                                        <IconButton
                                            icon={FiEdit}
                                            title="Editar"
                                            onClick={() => handleAbrirModalEdicao(cliente)}
                                        />
                                        <IconButton 
                                            icon={FiTrash} 
                                            title="Excluir"
                                            onClick={() => handleDeletar(cliente.id)} 
                                        />
                                    </div>
                                )}
                            />
                        ) : (
                            <div className="empty-table-placeholder">Nenhum cliente encontrado.</div>
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

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#5D78A9' }}>
                                        <label htmlFor="itensPorPaginaClientes">Itens por página:</label>
                                        <input 
                                            type="number"
                                            id="itensPorPaginaClientes"
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
                                        {totalElementos} cliente{totalElementos !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </TableContainer>

            <CadastrarClienteModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSalvar={handleSalvarCliente}
                clienteEditando={clienteEmEdicao}
            />

            {/* MODAL DE FILTRO AQUI */}
            <FilterClienteModal
                show={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onClear={limparFiltros}
                filtros={filtros}
                setFiltros={setFiltros}
                aplicarFiltros={aplicarFiltros}
            />
        </div>
    );
}